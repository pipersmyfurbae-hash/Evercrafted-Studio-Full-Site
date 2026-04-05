// EVERCRAFTED BLUEPRINT PDF GENERATOR

export function generateBlueprintPDF(svg: string) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Evercrafted Blueprint</title>
        <style>
          body { 
            font-family: serif; 
            text-align: center; 
            background: #F9F7F4; 
            padding: 40px;
            color: #333;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.05);
            border-radius: 8px;
          }
          h1 { 
            font-weight: normal; 
            letter-spacing: 0.1em; 
            text-transform: uppercase; 
            margin-bottom: 40px;
          }
          svg {
            max-width: 100%;
            height: auto;
            border: 1px solid #eee;
          }
          .footer {
            margin-top: 40px;
            font-style: italic;
            opacity: 0.6;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Evercrafted Blueprint</h1>
          ${svg}
          <div class="footer">
            <p>Follow placement by clock position and layer depth (Inner, Mid, Outer).</p>
            <p>&copy; Evercrafted Visualizer Engine</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);

  // Open in a new tab for printing
  const win = window.open(url, '_blank');
  if (win) {
    win.focus();
  }
}
