const FORBIDDEN_FLORALS = ['cherry blossom', 'twig blossom', 'cherry twig', 'sakura'];
const REQUIRED_FIELDS = ['wreath_id','size_in','emotion_profile','inventory_used','blueprint','layers'];
const VALID_RADIUS = ['inner','mid','outer'];
const VALID_LAYERS = ['base','greenery','focal','filler','accent'];

export function validate(json: string) {
  const checks: any[] = [];
  let data;

  try { data = JSON.parse(json); }
  catch(e) {
    return {
      verdict: 'invalid',
      checks: [{ id:'parse', cat:'Structure', status:'fail', label:'JSON Parse', msg:'Invalid JSON syntax.' }],
      score: 0
    };
  }

  // Structure checks
  const missingFields = REQUIRED_FIELDS.filter(f => !(f in data));
  if (missingFields.length === 0) {
    checks.push({ id:'struct_fields', cat:'Structure', status:'pass', label:'Required Fields', msg:'All required top-level fields present.' });
  } else {
    checks.push({ id:'struct_fields', cat:'Structure', status:'fail', label:'Required Fields', msg:`Missing: ${missingFields.join(', ')}` });
  }

  // Cluster checks
  if (data.blueprint && Array.isArray(data.blueprint)) {
    const focalItems = data.blueprint.filter((b: any) => b.category === 'focal');
    const clusterCount = focalItems.length;
    if (clusterCount >= 3 && clusterCount <= 5) {
      checks.push({ id:'cluster_count', cat:'Clusters', status:'pass', label:'Focal Cluster Count', msg:`${clusterCount} focal clusters.` });
    } else {
      checks.push({ id:'cluster_count', cat:'Clusters', status:'fail', label:'Focal Cluster Count', msg:`${clusterCount} focal clusters — must be 3–5.` });
    }
  }

  // Style checks
  const allNames = data.blueprint?.map((b: any) => (b.element || '').toLowerCase()) || [];
  const foundForbidden = allNames.filter((n: string) => FORBIDDEN_FLORALS.some(f => n.includes(f)));
  if (foundForbidden.length === 0) {
    checks.push({ id:'forbidden', cat:'Style', status:'pass', label:'Forbidden Florals', msg:'No forbidden florals detected.' });
  } else {
    checks.push({ id:'forbidden', cat:'Style', status:'fail', label:'Forbidden Florals', msg:`Forbidden floral(s) found: ${[...new Set(foundForbidden)].join(', ')}.` });
  }

  const pass = checks.filter(c => c.status === 'pass').length;
  const fail = checks.filter(c => c.status === 'fail').length;
  const total = checks.length;
  const score = total > 0 ? Math.round((pass / total) * 100) : 0;
  const verdict = fail === 0 ? 'valid' : 'invalid';

  return { verdict, checks, score, stats: { pass, fail, total } };
}
