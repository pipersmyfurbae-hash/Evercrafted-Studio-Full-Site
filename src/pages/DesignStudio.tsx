import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PenTool, Undo, Redo, Save, Download, RefreshCw, Layers, FolderOpen, Palette, Sparkles, Scale, Camera, Flower, GripVertical, Eye, EyeOff, ChevronUp, ChevronDown } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAuth } from '../contexts/AuthContext';
import { GoogleGenAI, Type } from "@google/genai";
import { db, auth } from '../lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { QualityGate } from '../components/QualityGate';
import { DesignIntelligencePanel } from '../components/DesignIntelligencePanel';
import { runOrchestrator } from '../services/BlueprintOrchestrator';
import { EngineElement, EngineBlueprint, Role } from '../types';
import { generatePlacement } from '../services/engine/placementEngine';
import { engineToUI } from '../services/transformer';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo?: any[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

function SortableItem({ id, item, idx, isSelected, onClick, getInventoryItem, getCategoryColor }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const invItem = getInventoryItem(item.role);

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`p-4 transition-all cursor-pointer border flex items-center gap-2 ${
        isSelected 
          ? 'bg-muted border-foreground/10' 
          : 'bg-transparent border-transparent hover:border-foreground/5'
      }`}
      onClick={onClick}
    >
      <div {...attributes} {...listeners} className="cursor-grab">
        <GripVertical className="w-4 h-4 opacity-30" />
      </div>
      <div className="flex items-center gap-4 flex-1">
        {invItem?.svg ? (
          <div className="w-8 h-8 flex-shrink-0 [&>svg]:w-full [&>svg]:h-full opacity-60" dangerouslySetInnerHTML={{ __html: invItem.svg }} />
        ) : (
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: getCategoryColor(item.role) }}></div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest truncate">{item.role}</p>
          <div className="flex justify-between text-[9px] opacity-40 uppercase tracking-tighter mt-1">
            <span>{Math.round(item.theta)}°</span>
            <span>{item.layer}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DesignStudio() {
  const { user } = useAuth();
  const [blueprints, setBlueprints] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>('');
  const [localBlueprint, setLocalBlueprint] = useState<any>(null);
  const [selectedElementIdx, setSelectedElementIdx] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isGeneratingPalette, setIsGeneratingPalette] = useState(false);
  const [isGeneratingTexture, setIsGeneratingTexture] = useState(false);
  const [isBalancing, setIsBalancing] = useState(false);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [isMimicking, setIsMimicking] = useState(false);
  const [suggestions, setSuggestions] = useState<{description: string, action: string, params: any}[]>([]);
  const [isGeneratingBlueprint, setIsGeneratingBlueprint] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [layerOrder, setLayerOrder] = useState<string[]>(['greenery', 'focal', 'filler', 'accent']);
  const [layerVisibility, setLayerVisibility] = useState<Record<string, boolean>>({
    greenery: true,
    focal: true,
    filler: true,
    accent: true,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleGenerateBlueprint = async () => {
    setIsGeneratingBlueprint(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = "gemini-3.1-pro-preview";
      
      const response = await ai.models.generateContent({
        model,
        contents: `Generate a luxury floral wreath blueprint based on this request: "${prompt}".
        
        CRITICAL: You must construct the wreath MATHEMATICALLY using the Engine Pack schema.
        - Define "clusters" with center (theta), spread, and density.
        - Define "open_arc" as [start, end] degrees for negative space.
        - Use a unique "seed" string.
        - Inventory available: ${JSON.stringify(inventory.map(i => i.name))}.
        
        Return a JSON object matching the EngineBlueprint schema.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              formula: { type: Type.STRING },
              seed: { type: Type.STRING },
              diameter: { type: Type.NUMBER },
              open_arc: {
                type: Type.ARRAY,
                items: { type: Type.NUMBER },
                minItems: 2,
                maxItems: 2
              },
              clusters: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    center: { type: Type.NUMBER },
                    spread: { type: Type.NUMBER },
                    density: { type: Type.NUMBER }
                  }
                }
              },
              renderPrompt: { type: Type.STRING }
            },
            required: ["title", "formula", "seed", "diameter", "open_arc", "clusters", "renderPrompt"]
          }
        }
      });
      
      const data = JSON.parse(response.text);
      
      // Use the Placement Engine to generate the actual elements
      const blueprintTemplate: EngineBlueprint = {
        id: Date.now().toString(),
        seed: data.seed || Math.random().toString(),
        formula: data.formula,
        open_arc: data.open_arc || [0, 0],
        clusters: data.clusters || [],
        elements: [], // Will be populated by placement engine
        base: {
          form: 'circular',
          diameter_inches: data.diameter || 24,
          frame_type: 'wire_wreath_frame'
        }
      };

      // Generate placements
      blueprintTemplate.elements = generatePlacement(blueprintTemplate);

      setLocalBlueprint({
        ...blueprintTemplate,
        title: data.title,
        renderPrompt: data.renderPrompt,
        palette: { focal: '#f43f5e', greenery: '#22c55e', filler: '#eab308', accent: '#3b82f6' }
      });
      
      setBlueprints(prev => [blueprintTemplate, ...prev]);
      setSelectedBlueprintId(blueprintTemplate.id);
      setHasUnsavedChanges(true);
      
      toast.success('Blueprint generated via Engine Pack!');
    } catch (error) {
      console.error("Blueprint generation failed:", error);
      toast.error('Failed to generate blueprint');
    } finally {
      setIsGeneratingBlueprint(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!localBlueprint) return;
    setIsGeneratingImage(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = 'gemini-3.1-flash-image-preview';
      
      const response = await ai.models.generateContent({
        model,
        contents: {
          parts: [{ text: localBlueprint.renderPrompt || 'A luxury faux botanical wreath' }],
        },
        config: {
          imageConfig: { aspectRatio: "1:1", imageSize: "1K" }
        },
      });
      
      let imageUrl = '';
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      
      setGeneratedImage(imageUrl);
    } catch (error) {
      console.error("Image generation failed:", error);
      toast.error('Failed to generate image');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleExportSvg = () => {
    if (!localBlueprint) return;
    const svgString = generateSvgString(localBlueprint);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'blueprint.svg';
    link.click();
  };

  const handleExportPdf = () => {
    if (!localBlueprint) return;
    const doc = new jsPDF();
    const title = localBlueprint.title || 'Evercrafted Wreath Blueprint';
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text(title, 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 28, { align: 'center' });

    // 1. Element List Table
    const elements = getElements(localBlueprint);
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('1. Material List', 14, 45);
    
    autoTable(doc, {
      head: [['Role', 'Layer', 'Theta', 'Radius', 'Scale']],
      body: elements.map((e: any) => [
        e.role.toUpperCase(), 
        e.layer.toUpperCase(), 
        `${Math.round(e.theta)}°`, 
        e.radius.toFixed(2), 
        e.scale.toFixed(1)
      ]),
      startY: 50,
      theme: 'striped',
      headStyles: { fillColor: [40, 40, 40] },
      styles: { fontSize: 9 }
    });

    // 2. Build Sequence
    let currentY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text('2. Build Sequence', 14, currentY);
    
    const steps = [
      { role: 'greenery', label: 'Step 1: Establish the Base (Greenery)' },
      { role: 'focal', label: 'Step 2: Place Focal Elements' },
      { role: 'filler', label: 'Step 3: Add Filler & Texture' },
      { role: 'accent', label: 'Step 4: Final Accents & Detail' }
    ];

    doc.setFontSize(10);
    currentY += 10;
    steps.forEach(step => {
      const stepElements = elements.filter((e: any) => e.role === step.role);
      if (stepElements.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.text(step.label, 14, currentY);
        doc.setFont('helvetica', 'normal');
        currentY += 6;
        stepElements.forEach((e: any) => {
          doc.text(`• Place ${e.role} at ${Math.round(e.theta)}° (${e.layer} layer)`, 20, currentY);
          currentY += 5;
        });
        currentY += 5;
      }
    });

    doc.save(`${title.replace(/\s+/g, '_')}_Blueprint.pdf`);
  };

  const generateSvgString = (blueprint: any) => {
    const elements = getElements(blueprint);
    const svgElements = elements.map((item: any, idx: number) => {
      const angleRad = (item.angle_deg - 90) * (Math.PI / 180);
      const maxRadius = 280;
      const radius = maxRadius * getRadiusPercent(item.radius);
      const x = 300 + Math.cos(angleRad) * radius;
      const y = 300 + Math.sin(angleRad) * radius;
      const size = 30 + (item.stem_count * 4);
      
      return `
        <g transform="translate(${x}, ${y})">
          <circle r="${size / 2}" fill="${getCategoryColor(item.category)}" fill-opacity="0.8" stroke="white" stroke-width="1" />
          <text dy=".3em" text-anchor="middle" font-size="8" fill="white" font-family="sans-serif">${idx + 1}</text>
        </g>`;
    }).join('');

    return `
      <svg width="600" height="600" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
        <rect width="600" height="600" fill="#fcfbf9" />
        <circle cx="300" cy="300" r="290" fill="none" stroke="#e5e7eb" stroke-width="1" />
        <circle cx="300" cy="300" r="200" fill="none" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="4" />
        <circle cx="300" cy="300" r="100" fill="none" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="4" />
        ${svgElements}
        <text x="300" y="580" text-anchor="middle" font-size="12" font-family="serif" fill="#1a1a1a">${blueprint.title || 'Wreath Blueprint'}</text>
      </svg>
    `;
  };
  const [scoreReport, setScoreReport] = useState<any>(null);

  useEffect(() => {
    if (localBlueprint) {
      runOrchestrator(localBlueprint, localBlueprint.emotion_profile).then(({ report }) => {
        setScoreReport(report);
      });
    } else {
      setScoreReport(null);
    }
  }, [localBlueprint]);

  useEffect(() => {
    if (!user) return;

    const qBlueprints = query(collection(db, 'blueprints'), where('userId', '==', user.uid));
    const unsubscribeBlueprints = onSnapshot(qBlueprints, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBlueprints(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'blueprints');
    });

    const qInventory = query(collection(db, 'inventory'), where('userId', '==', user.uid));
    const unsubscribeInventory = onSnapshot(qInventory, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInventory(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'inventory');
    });

    return () => {
      unsubscribeBlueprints();
      unsubscribeInventory();
    };
  }, [user]);

  // When selected blueprint changes, update local state
  useEffect(() => {
    const active = blueprints.find(bp => bp.id === selectedBlueprintId);
    if (active) {
      // Normalize blueprint structure if needed
      const bp = { ...active };
      
      // If it's a legacy blueprint, we might need to handle it, 
      // but for now we assume it matches EngineBlueprint or has elements
      if (!bp.elements && bp.blueprint) {
        bp.elements = Array.isArray(bp.blueprint) ? bp.blueprint : [];
      }
      
      setLocalBlueprint(bp);
      setHasUnsavedChanges(false);
      setSelectedElementIdx(null);
    } else {
      setLocalBlueprint(null);
      setHasUnsavedChanges(false);
      setSelectedElementIdx(null);
    }
  }, [selectedBlueprintId, blueprints]);

  const getElements = (bp: any): EngineElement[] => {
    if (!bp) return [];
    return bp.elements || [];
  };

  const toggleLayerVisibility = (category: string) => {
    setLayerVisibility(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const moveLayer = (category: string, direction: 'up' | 'down') => {
    const index = layerOrder.indexOf(category);
    if (direction === 'up' && index > 0) {
      const newOrder = [...layerOrder];
      [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
      setLayerOrder(newOrder);
    } else if (direction === 'down' && index < layerOrder.length - 1) {
      const newOrder = [...layerOrder];
      [newOrder[index + 1], newOrder[index]] = [newOrder[index], newOrder[index + 1]];
      setLayerOrder(newOrder);
    }
  };

  const selectedElement = localBlueprint && selectedElementIdx !== null ? getElements(localBlueprint)[selectedElementIdx] : null;

  // Helper to convert radius string to a percentage
  const getRadiusPercent = (radiusStr: string) => {
    if (radiusStr === 'inner') return 0.3;
    if (radiusStr === 'mid') return 0.6;
    if (radiusStr === 'outer') return 0.9;
    return 0.5;
  };

  // Helper to get filter based on texture
  const getTextureFilter = (texture: string) => {
    switch (texture) {
      case 'Silk': return 'brightness(1.1) saturate(1.2) contrast(0.9)';
      case 'Latex': return 'brightness(1.2) saturate(1.5) contrast(1.1)';
      case 'Dried': return 'sepia(0.5) brightness(0.9) saturate(0.7)';
      case 'Fresh': return 'brightness(1.0) saturate(1.3) contrast(1.0) hue-rotate(-5deg)';
      default: return 'none';
    }
  };

  // Helper to get color based on category
  const getCategoryColor = (category: string) => {
    if (localBlueprint?.palette && localBlueprint.palette[category]) {
      return localBlueprint.palette[category];
    }
    switch (category) {
      case 'focal': return '#f43f5e'; // rose-500
      case 'greenery': return '#22c55e'; // green-500
      case 'filler': return '#eab308'; // yellow-500
      case 'accent': return '#3b82f6'; // blue-500
      default: return '#94a3b8'; // slate-400
    }
  };

  const handleColorHarmony = async () => {
    if (!localBlueprint) return;
    setIsGeneratingPalette(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = "gemini-3-flash-preview";
      
      const response = await ai.models.generateContent({
        model,
        contents: `Generate a harmonious floral color palette for a luxury wreath based on a base focal color of ${getCategoryColor('focal')}. 
        Return a JSON object with keys: focal, greenery, filler, accent. 
        Use hex codes. Ensure they look elegant and high-end together.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              focal: { type: Type.STRING },
              greenery: { type: Type.STRING },
              filler: { type: Type.STRING },
              accent: { type: Type.STRING },
            },
          },
        },
      });

      const palette = JSON.parse(response.text);
      setLocalBlueprint({ ...localBlueprint, palette });
      setHasUnsavedChanges(true);
      toast.success('New color palette applied!');
    } catch (error) {
      console.error("Color Harmony failed:", error);
      toast.error('Failed to generate palette');
    } finally {
      setIsGeneratingPalette(false);
    }
  };

  const handleTextureMixer = async () => {
    if (!selectedElement) {
      toast.error('Please select an element first');
      return;
    }
    setIsGeneratingTexture(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = "gemini-3-flash-preview";
      
      const response = await ai.models.generateContent({
        model,
        contents: `Suggest 3 unique, trending material combinations for a ${selectedElement.role} in a high-end luxury faux botanical wreath. 
        Focus on editorial design trends (e.g., mixing velvet, dried elements, silk, etc.). 
        Return a JSON object with a 'suggestions' key containing an array of strings.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              suggestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
          },
        },
      });

      const { suggestions } = JSON.parse(response.text);
      toast.info(`Texture Suggestions for ${selectedElement.role}: ${suggestions.join(', ')}`);
    } catch (error) {
      console.error("Texture Mixer failed:", error);
      toast.error('Failed to generate texture suggestions');
    } finally {
      setIsGeneratingTexture(false);
    }
  };
  const handleBalanceSuggestions = async () => {
    setIsGeneratingSuggestions(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = "gemini-3-flash-preview";
      
      const response = await ai.models.generateContent({
        model,
        contents: `Analyze this wreath design for visual balance and suggest 3 improvements.
        
        Blueprint: ${JSON.stringify({
          clusters: localBlueprint.clusters,
          open_arc: localBlueprint.open_arc,
          formula: localBlueprint.formula
        })}
        
        Return a JSON array of suggestions. Each suggestion must have:
        - id: string
        - title: string
        - description: string
        - type: 'adjustment' | 'addition' | 'removal'
        - impact: 'high' | 'medium' | 'low'
        - action: { type: string, payload: any }`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                type: { type: Type.STRING },
                impact: { type: Type.STRING },
                action: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING },
                    payload: { type: Type.OBJECT }
                  }
                }
              },
              required: ["id", "title", "description", "type", "impact", "action"]
            }
          }
        }
      });
      
      setSuggestions(JSON.parse(response.text));
    } catch (error) {
      console.error("Suggestions failed:", error);
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const handleStyleMimic = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !localBlueprint) return;
    
    setIsMimicking(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64Image = reader.result as string;
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const model = "gemini-3.1-flash-image-preview";
        
        const response = await ai.models.generateContent({
          model,
          contents: {
            parts: [
              { inlineData: { data: base64Image.split(',')[1], mimeType: file.type } },
              { text: `Analyze this floral design style and suggest how to achieve a similar look using these inventory items: ${JSON.stringify(inventory.map(i => i.name))}. 
              Return a JSON object with a 'suggestions' key containing an array of strings.` }
            ],
          },
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                suggestions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
            },
          },
        });

        const { suggestions } = JSON.parse(response.text);
        toast.info(`Style Mimic Suggestions: ${suggestions.join(' ')}`);
        setIsMimicking(false);
      };
    } catch (error) {
      console.error("Style Mimic failed:", error);
      toast.error('Failed to analyze style');
      setIsMimicking(false);
    }
  };

  // Helper to find inventory item by name
  const getInventoryItem = (elementName: string) => {
    if (!elementName) return undefined;
    // Try to find an exact match or a partial match
    return inventory.find(item => 
      item.name.toLowerCase() === elementName.toLowerCase() ||
      elementName.toLowerCase().includes(item.name.toLowerCase()) ||
      item.name.toLowerCase().includes(elementName.toLowerCase())
    );
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = localBlueprint.elements.findIndex((item: any) => item.id === active.id);
      const newIndex = localBlueprint.elements.findIndex((item: any) => item.id === over.id);

      const updatedBlueprint = { ...localBlueprint };
      updatedBlueprint.elements = arrayMove(updatedBlueprint.elements, oldIndex, newIndex);
      
      setLocalBlueprint(updatedBlueprint);
      setHasUnsavedChanges(true);
      setSelectedElementIdx(newIndex); // Update selected index to match new position
    }
  };

  const handleSave = async () => {
    if (!localBlueprint || !user) return;
    setIsSaving(true);
    try {
      const bpRef = doc(db, 'blueprints', localBlueprint.id);
      await setDoc(bpRef, {
        ...localBlueprint,
        userId: user.uid,
        updatedAt: new Date().toISOString()
      });
      setHasUnsavedChanges(false);
      toast.success('Blueprint saved successfully');
    } catch (error) {
      console.error("Save failed:", error);
      toast.error('Failed to save blueprint');
      handleFirestoreError(error, OperationType.UPDATE, `blueprints/${localBlueprint.id}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleElementChange = (field: string, value: any) => {
    if (!localBlueprint || selectedElementIdx === null) return;
    
    const updatedElements = [...localBlueprint.elements];
    updatedElements[selectedElementIdx] = {
      ...updatedElements[selectedElementIdx],
      [field]: value
    };
    
    setLocalBlueprint({
      ...localBlueprint,
      elements: updatedElements,
      blueprint: updatedElements.map(engineToUI) as any
    });
    setHasUnsavedChanges(true);
  };

  const applySuggestion = (suggestion: any) => {
    if (!localBlueprint) return;
    
    const { type, payload } = suggestion.action;
    let updatedBlueprint = { ...localBlueprint };

    if (type === 'adjust_cluster') {
      updatedBlueprint.clusters = updatedBlueprint.clusters.map((c: any, idx: number) => 
        idx === payload.clusterIndex ? { ...c, ...payload.changes } : c
      );
      // Re-generate placements
      updatedBlueprint.elements = generatePlacement(updatedBlueprint);
      updatedBlueprint.blueprint = updatedBlueprint.elements.map(engineToUI) as any;
    } else if (type === 'update_open_arc') {
      updatedBlueprint.open_arc = payload.open_arc;
      updatedBlueprint.elements = generatePlacement(updatedBlueprint);
      updatedBlueprint.blueprint = updatedBlueprint.elements.map(engineToUI) as any;
    }

    setLocalBlueprint(updatedBlueprint);
    setHasUnsavedChanges(true);
    toast.success(`Applied: ${suggestion.title}`);
  };

  const handleRemoveElement = () => {
    if (!localBlueprint || selectedElementIdx === null) return;
    
    const updatedElements = [...localBlueprint.elements];
    updatedElements.splice(selectedElementIdx, 1);
    
    setLocalBlueprint({
      ...localBlueprint,
      elements: updatedElements,
      blueprint: updatedElements.map(engineToUI) as any
    });
    setSelectedElementIdx(null);
    setHasUnsavedChanges(true);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Top Toolbar */}
      <header className="flex items-center justify-between px-12 py-8 border-b border-foreground/5 bg-background/50 backdrop-blur-md sticky top-0 z-20">
        <div className="space-y-1">
          <span className="display-text opacity-40">Blueprint Studio</span>
          <h1 className="editorial-title text-4xl">
            {localBlueprint ? localBlueprint.name || 'Untitled Design' : 'Blueprint Editor'}
          </h1>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
            <span className="display-text opacity-30">Load</span>
            <Select value={selectedBlueprintId} onValueChange={setSelectedBlueprintId}>
              <SelectTrigger className="w-[250px] border-none bg-muted/50 text-[10px] uppercase tracking-widest h-10">
                <SelectValue placeholder="Select Blueprint..." />
              </SelectTrigger>
              <SelectContent>
                {blueprints.map(bp => (
                  <SelectItem key={bp.id} value={bp.id} className="text-[10px] uppercase tracking-widest">
                    {bp.name || 'Untitled'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hover:bg-muted" onClick={handleColorHarmony} disabled={isGeneratingPalette}>
              <Palette className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-muted" onClick={handleTextureMixer} disabled={isGeneratingTexture}>
              <Sparkles className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-muted" onClick={handleBalanceSuggestions} disabled={isBalancing}>
              <Scale className="w-4 h-4" />
            </Button>
            <label className="cursor-pointer">
              <input type="file" className="hidden" accept="image/*" onChange={handleStyleMimic} />
              <div className={`p-2 rounded-md hover:bg-muted ${isMimicking ? 'opacity-50' : ''}`}>
                <Camera className="w-4 h-4" />
              </div>
            </label>
            <Button variant="ghost" size="icon" className="hover:bg-muted" onClick={handleSave}><Save className="w-4 h-4" /></Button>
            <Select onValueChange={(val) => val === 'svg' ? handleExportSvg() : handleExportPdf()}>
              <SelectTrigger className="w-[120px] h-10 bg-muted/50 border-none text-[10px] font-bold uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <Download className="w-3 h-3" />
                  <span>Export</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="svg" className="text-[10px] uppercase tracking-widest">SVG Layout</SelectItem>
                <SelectItem value="pdf" className="text-[10px] uppercase tracking-widest">PDF Blueprint</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              className="display-text px-8 h-10 bg-foreground text-background hover:opacity-80 transition-opacity" 
              onClick={handleSave}
              disabled={!localBlueprint || isSaving || !hasUnsavedChanges}
            >
              {isSaving ? 'Saving...' : 'Save Blueprint'}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        {/* Left Column: Layers & Properties */}
        <aside className="w-80 border-r border-foreground/5 flex flex-col bg-background overflow-y-auto">
          <div className="p-8 border-b border-foreground/5">
            <span className="display-text opacity-40">Category Layers</span>
          </div>
          <div className="p-4 space-y-2 border-b border-foreground/5">
            {layerOrder.map((category, idx) => (
              <div key={category} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-foreground/5">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => toggleLayerVisibility(category)}
                    className="opacity-40 hover:opacity-100 transition-opacity"
                  >
                    {layerVisibility[category] ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getCategoryColor(category) }} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{category}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => moveLayer(category, 'up')}
                    disabled={idx === 0}
                    className="opacity-20 hover:opacity-100 disabled:opacity-5 transition-opacity"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => moveLayer(category, 'down')}
                    disabled={idx === layerOrder.length - 1}
                    className="opacity-20 hover:opacity-100 disabled:opacity-5 transition-opacity"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-8 border-b border-foreground/5">
            <span className="display-text opacity-40">Composition Elements</span>
          </div>
          <div className="p-4 space-y-2 border-b border-foreground/5">
            {localBlueprint ? (
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={localBlueprint.elements.map((i: any) => i.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {localBlueprint.elements.map((item: any, idx: number) => (
                    <SortableItem 
                      key={item.id}
                      id={item.id}
                      item={item}
                      idx={idx}
                      isSelected={selectedElementIdx === idx}
                      onClick={() => setSelectedElementIdx(idx)}
                      getInventoryItem={getInventoryItem}
                      getCategoryColor={getCategoryColor}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            ) : (
              <div className="text-[10px] uppercase tracking-widest opacity-30 text-center p-12">
                No active blueprint
              </div>
            )}
          </div>
          
          <div className="p-8 border-b border-foreground/5">
            <span className="display-text opacity-40">Global Construction</span>
          </div>
          <div className="p-8 space-y-8 border-b border-foreground/5">
            {localBlueprint && (
              <>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="display-text text-[9px] opacity-40">Arc Start (°)</label>
                    <input 
                      type="number" 
                      className="w-full bg-muted/50 border-none p-3 text-[10px] font-bold focus:ring-1 ring-foreground/10 outline-none" 
                      value={localBlueprint.open_arc?.[0] || 0} 
                      onChange={(e) => setLocalBlueprint({
                        ...localBlueprint,
                        open_arc: [Number(e.target.value), localBlueprint.open_arc?.[1] || 0]
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="display-text text-[9px] opacity-40">Arc End (°)</label>
                    <input 
                      type="number" 
                      className="w-full bg-muted/50 border-none p-3 text-[10px] font-bold focus:ring-1 ring-foreground/10 outline-none" 
                      value={localBlueprint.open_arc?.[1] || 0} 
                      onChange={(e) => setLocalBlueprint({
                        ...localBlueprint,
                        open_arc: [localBlueprint.open_arc?.[0] || 0, Number(e.target.value)]
                      })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="display-text text-[9px] opacity-40">Deterministic Seed</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      className="flex-1 bg-muted/50 border-none p-3 text-[10px] font-bold focus:ring-1 ring-foreground/10 outline-none" 
                      value={localBlueprint.seed || ''} 
                      onChange={(e) => setLocalBlueprint({ ...localBlueprint, seed: e.target.value })}
                    />
                    <Button variant="outline" size="icon" onClick={() => setLocalBlueprint({ ...localBlueprint, seed: Math.random().toString(36).substr(2, 9) })}>
                      <RefreshCw className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="p-8 border-b border-foreground/5">
            <span className="display-text opacity-40">Properties</span>
          </div>
          <div className="p-8">
            {localBlueprint && (
              <div>
                <div className="mb-12">
                  <Button 
                    className="w-full" 
                    onClick={handleGenerateBlueprint} 
                    disabled={isGeneratingBlueprint}
                  >
                    {isGeneratingBlueprint ? 'Generating...' : 'Generate Blueprint'}
                  </Button>
                </div>
                <div className="mb-12">
                  <DesignIntelligencePanel blueprint={localBlueprint} />
                </div>
              </div>
            )}
            {scoreReport && (
              <div className="mb-12">
                <QualityGate 
                  blueprint={localBlueprint} 
                  emotionProfile={localBlueprint.emotion_profile} 
                  onRepair={(updated) => setLocalBlueprint({ ...localBlueprint, ...updated })} 
                />
              </div>
            )}
            {suggestions.length > 0 && (
              <div className="mb-12 p-6 bg-muted/50 rounded-lg space-y-4">
                <h3 className="editorial-title text-xl">AI Suggestions</h3>
                <ul className="space-y-2">
                  {suggestions.map((s, i) => (
                    <li key={i} className="text-xs flex items-center justify-between gap-2">
                      <span>{s.description}</span>
                      <Button size="sm" onClick={() => applySuggestion(s)}>Apply</Button>
                    </li>
                  ))}
                </ul>
                <Button variant="ghost" size="sm" onClick={() => setSuggestions([])}>Clear</Button>
              </div>
            )}
            {selectedElement ? (
              <div className="space-y-12">
                <div className="space-y-2">
                  <h3 className="editorial-title text-3xl">{selectedElement.role}</h3>
                  <p className="text-[9px] uppercase tracking-[0.2em] opacity-40">Engine Pack Construction</p>
                </div>

                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="display-text text-[9px] opacity-40">Theta (Degrees)</label>
                      <input 
                        type="number" 
                        className="w-full bg-muted/50 border-none p-3 text-[10px] font-bold focus:ring-1 ring-foreground/10 outline-none" 
                        value={selectedElement.theta || 0} 
                        onChange={(e) => handleElementChange('theta', Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="display-text text-[9px] opacity-40">Radius (0-1)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        className="w-full bg-muted/50 border-none p-3 text-[10px] font-bold focus:ring-1 ring-foreground/10 outline-none" 
                        value={selectedElement.radius || 0} 
                        onChange={(e) => handleElementChange('radius', Number(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="display-text text-[9px] opacity-40">Scale</label>
                      <input 
                        type="number" 
                        step="0.1"
                        className="w-full bg-muted/50 border-none p-3 text-[10px] font-bold focus:ring-1 ring-foreground/10 outline-none" 
                        value={selectedElement.scale || 1} 
                        onChange={(e) => handleElementChange('scale', Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="display-text text-[9px] opacity-40">Rotation (°)</label>
                      <input 
                        type="number" 
                        className="w-full bg-muted/50 border-none p-3 text-[10px] font-bold focus:ring-1 ring-foreground/10 outline-none" 
                        value={selectedElement.rotation || 0} 
                        onChange={(e) => handleElementChange('rotation', Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="display-text text-[9px] opacity-40">Layer</label>
                      <select 
                        className="w-full bg-muted/50 border-none p-3 text-[10px] font-bold focus:ring-1 ring-foreground/10 outline-none appearance-none" 
                        value={selectedElement.layer || 'mid'}
                        onChange={(e) => handleElementChange('layer', e.target.value)}
                      >
                        <option value="inner">Inner</option>
                        <option value="mid">Mid</option>
                        <option value="outer">Outer</option>
                        <option value="edge">Edge</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="display-text text-[9px] opacity-40">Role</label>
                      <select 
                        className="w-full bg-muted/50 border-none p-3 text-[10px] font-bold focus:ring-1 ring-foreground/10 outline-none appearance-none" 
                        value={selectedElement.role || 'filler'}
                        onChange={(e) => handleElementChange('role', e.target.value)}
                      >
                        <option value="focal">Focal</option>
                        <option value="secondary">Secondary</option>
                        <option value="accent">Accent</option>
                        <option value="filler">Filler</option>
                        <option value="greenery">Greenery</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-12 border-t border-foreground/5">
                  <button 
                    className="display-text text-destructive hover:opacity-50 transition-opacity"
                    onClick={handleRemoveElement}
                  >
                    Remove Element
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-[10px] uppercase tracking-widest opacity-30 text-center py-20">
                Select element to edit
              </div>
            )}
          </div>
        </aside>

        {/* Right Side: Canvas */}
        <div className="flex-1 bg-[#fcfbf9] overflow-y-auto p-8 relative flex items-center justify-center">
          <div className="absolute top-8 left-8 z-10">
            <span className="display-text text-[10px] opacity-20 uppercase tracking-[0.3em]">Blueprint Visualizer v2.2</span>
          </div>

          {/* Radial Grid & Base */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Open Arc Exclusion Zone Visualization */}
            {localBlueprint?.open_arc && (
              <div 
                className="absolute w-[600px] h-[600px] rounded-full overflow-hidden opacity-[0.03] pointer-events-none"
                style={{
                  background: `conic-gradient(from ${localBlueprint.open_arc.start}deg, transparent 0deg, #ff0000 ${localBlueprint.open_arc.end - localBlueprint.open_arc.start}deg, transparent ${localBlueprint.open_arc.end - localBlueprint.open_arc.start}deg)`
                }}
              />
            )}
            
            {/* Base Texture (Grapevine/Straw feel) */}
            <div className="absolute w-[580px] h-[580px] rounded-full border-[24px] border-[#4a3728]/10 blur-[2px]" />
            <div className="absolute w-[560px] h-[560px] rounded-full border-[1px] border-[#4a3728]/5" />
            
            <div className="opacity-[0.08]">
              <div className="w-[600px] h-[600px] border border-foreground rounded-full" />
              <div className="w-[450px] h-[450px] border border-foreground rounded-full" />
              <div className="w-[300px] h-[300px] border border-foreground rounded-full" />
              <div className="w-[150px] h-[150px] border border-foreground rounded-full" />
            </div>

            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => (
              <div 
                key={deg} 
                className="absolute w-[640px] h-px flex justify-between px-1" 
                style={{ transform: `rotate(${deg}deg)` }} 
              >
                <span className="text-[9px] font-mono opacity-20" style={{ transform: `rotate(${-deg}deg)` }}>
                  {((deg / 30 + 3) % 12 || 12)}
                </span>
                <span className="text-[9px] font-mono opacity-20" style={{ transform: `rotate(${-deg}deg)` }}>
                  {((deg / 30 + 9) % 12 || 12)}
                </span>
              </div>
            ))}
          </div>
          
          <div className="relative w-[600px] h-[600px] mx-auto rounded-full border border-foreground/5 bg-background/20 backdrop-blur-[2px] shadow-2xl flex items-center justify-center">
            {/* Center point */}
            <div className="absolute w-1.5 h-1.5 bg-foreground/30 rounded-full" />
            
            {/* Open Arc Visualization */}
            {localBlueprint?.open_arc && (localBlueprint.open_arc[0] !== 0 || localBlueprint.open_arc[1] !== 0) && (
              <div 
                className="absolute inset-0 rounded-full pointer-events-none opacity-20"
                style={{ 
                  background: `conic-gradient(from ${localBlueprint.open_arc[0]}deg, transparent 0deg, rgba(0,0,0,0.1) 0deg, rgba(0,0,0,0.1) ${localBlueprint.open_arc[1] - localBlueprint.open_arc[0]}deg, transparent ${localBlueprint.open_arc[1] - localBlueprint.open_arc[0]}deg)`
                }}
              />
            )}

            {/* Render Blueprint Elements */}
            {getElements(localBlueprint)
              ?.filter((item: EngineElement) => {
                const isVisible = layerVisibility[item.role] !== false;
                return isVisible;
              })
              ?.sort((a: EngineElement, b: EngineElement) => {
                const aIdx = layerOrder.indexOf(a.role);
                const bIdx = layerOrder.indexOf(b.role);
                return bIdx - aIdx; // Render bottom layers first
              })
              ?.map((item: EngineElement, idx: number) => {
                const isSelected = selectedElementIdx === idx;
                const invItem = getInventoryItem(item.role);
                const categoryColor = getCategoryColor(item.role);
                
                // Base position
                const angleRad = (item.theta - 90) * (Math.PI / 180);
                const maxRadius = 300;
                const baseRadius = maxRadius * item.radius;
                const x = Math.cos(angleRad) * baseRadius;
                const y = Math.sin(angleRad) * baseRadius;

                const size = 32 * (item.scale || 1);
                const offset = size / 2;

                return (
                  <div 
                    key={item.id || idx}
                    className={`absolute flex items-center justify-center cursor-pointer transition-all duration-700 ${
                      isSelected ? 'z-30' : 'z-10'
                    }`}
                    style={{ 
                      transform: `translate(${x}px, ${y}px)`,
                      opacity: isSelected ? 1 : 0.8,
                      width: `${size}px`,
                      height: `${size}px`,
                      marginLeft: `-${offset}px`,
                      marginTop: `-${offset}px`,
                    }}
                    onClick={() => setSelectedElementIdx(idx)}
                  >
                    {invItem?.svg ? (
                      <div 
                        className={`w-full h-full transition-all ${isSelected ? 'drop-shadow-xl scale-125' : 'grayscale opacity-60 hover:grayscale-0 hover:opacity-100'} [&>svg]:w-full [&>svg]:h-full`} 
                        dangerouslySetInnerHTML={{ __html: invItem.svg }} 
                        style={{ 
                          transform: `rotate(${(item.rotation || 0)}deg)`,
                        }}
                      />
                    ) : (
                      <div 
                        className={`w-full h-full rounded-full flex items-center justify-center ${isSelected ? 'ring-2 ring-foreground scale-125 shadow-lg' : 'opacity-80'}`}
                        style={{ backgroundColor: categoryColor }}
                      >
                        <Flower className="w-1/2 h-1/2 text-white" />
                      </div>
                    )}
                  </div>
                );
              })}

            {!localBlueprint && (
              <div className="text-center space-y-4">
                <span className="display-text opacity-20">Awaiting Blueprint</span>
              </div>
            )}
          </div>

          {/* AI Render Image */}
          {localBlueprint && (
            <div className="mt-12 max-w-2xl mx-auto">
              <Button 
                className="w-full" 
                onClick={handleGenerateImage} 
                disabled={isGeneratingImage}
              >
                {isGeneratingImage ? 'Generating...' : 'Render Design'}
              </Button>
              {generatedImage && (
                <div className="mt-4">
                  <img src={generatedImage} alt="Generated Wreath" className="w-full rounded-lg shadow-2xl" />
                  <Button variant="outline" className="w-full mt-2" onClick={handleGenerateImage}>Regenerate</Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
