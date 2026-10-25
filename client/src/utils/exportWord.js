import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType
} from 'docx';

/**
 * Esporta il piano alimentare completo in un documento Microsoft Word (.docx)
 * modificabile al 100% dal nutrizionista.
 *
 * @param {Object} planData - I dati del piano (copertina, raccomandazioni, colazione, sport, giorni)
 * @param {Object} patient - Informazioni anagrafiche del paziente
 * @param {Object} settings - Informazioni studio e nutrizionista
 */
export async function exportDietToWord(planData, patient, settings) {
  const patientName = patient
    ? `${patient.first_name || ''} ${patient.last_name || ''}`.trim()
    : (planData.patient_name || 'Paziente');

  const studioName = settings?.studio_name || 'NutriGest - Studio Nutrizionale';
  const nutritionistName = settings?.nutritionist_name || 'Dott.ssa Nutrizionista';
  const nutritionistTitle = settings?.title || 'Biologa Nutrizionista';
  const calories = planData.target_calories || 2200;
  const macros = planData.macronutrients || { prot: 20, carb: 50, fat: 30 };

  const primaryColor = '1E3A5F';
  const secondaryColor = '3B6998';
  const darkTextColor = '1E293B';
  const mutedTextColor = '64748B';

  const doc = new Document({
    creator: nutritionistName,
    title: `Piano Alimentare - ${patientName}`,
    description: `Piano alimentare personalizzato (${calories} kcal) per ${patientName}`,
    styles: {
      default: {
        document: {
          run: {
            font: 'Calibri',
            size: 22, // 11pt
            color: darkTextColor
          },
          paragraph: {
            spacing: { line: 276, before: 100, after: 100 }
          }
        }
      }
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              right: 1440,
              bottom: 1440,
              left: 1440
            }
          }
        },
        children: [
          // ==========================================
          // 1. COPERTINA
          // ==========================================
          new Paragraph({
            text: studioName.toUpperCase(),
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 300 },
            style: {
              run: { color: mutedTextColor, size: 20, bold: true, letterSpacing: 40 }
            }
          }),

          new Paragraph({
            text: 'PIANO ALIMENTARE',
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 100 },
            border: {
              top: { style: BorderStyle.SINGLE, size: 12, color: primaryColor },
              bottom: { style: BorderStyle.SINGLE, size: 12, color: primaryColor }
            },
            style: {
              run: { color: primaryColor, size: 48, bold: true, letterSpacing: 60 }
            }
          }),

          new Paragraph({
            text: 'PERSONALIZZATO AD ALTA ADERENZA',
            alignment: AlignmentType.CENTER,
            spacing: { before: 150, after: 800 },
            style: {
              run: { color: secondaryColor, size: 22, italics: true }
            }
          }),

          // Box Dati Paziente
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: 'F0F4FA' },
                    margins: { top: 200, bottom: 200, left: 240, right: 240 },
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E1' },
                      bottom: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E1' },
                      left: { style: BorderStyle.SINGLE, size: 18, color: primaryColor },
                      right: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E1' }
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'PAZIENTE: ', bold: true, color: primaryColor, size: 24 }),
                          new TextRun({ text: patientName, bold: true, size: 26, color: darkTextColor })
                        ],
                        spacing: { after: 120 }
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'OBIETTIVO ENERGETICO: ', bold: true, color: primaryColor }),
                          new TextRun({ text: `${calories} kcal / giorno`, bold: true })
                        ],
                        spacing: { after: 100 }
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'RIPARTIZIONE MACRONUTRIENTI: ', bold: true, color: primaryColor }),
                          new TextRun({ text: `Proteine ${macros.prot}%  •  Carboidrati ${macros.carb}%  •  Grassi ${macros.fat}%` })
                        ],
                        spacing: { after: 100 }
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'SPECIALISTA: ', bold: true, color: primaryColor }),
                          new TextRun({ text: `${nutritionistName} (${nutritionistTitle})` })
                        ]
                      })
                    ]
                  })
                ]
              })
            ]
          }),

          new Paragraph({
            text: '',
            spacing: { before: 1200 },
            pageBreakBefore: true
          }),

          // ==========================================
          // 2. RACCOMANDAZIONI GENERALI
          // ==========================================
          new Paragraph({
            text: 'RACCOMANDAZIONI GENERALI',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 300 },
            style: { run: { color: primaryColor, bold: true, size: 32 } }
          }),

          ...(planData.recommendations || []).map((rec) =>
            new Paragraph({
              bullet: { level: 0 },
              children: [
                new TextRun({
                  text: rec,
                  color: darkTextColor,
                  size: 22
                })
              ],
              spacing: { before: 80, after: 120 }
            })
          ),

          new Paragraph({
            text: '',
            spacing: { before: 400 },
            pageBreakBefore: true
          }),

          // ==========================================
          // 3. CONSIGLI UTILI & TRUCCHI IN CUCINA
          // ==========================================
          new Paragraph({
            text: 'CONSIGLI UTILI IN CUCINA',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 300 },
            style: { run: { color: primaryColor, bold: true, size: 32 } }
          }),

          ...(planData.cooking_tips || []).map((tip) => {
            const paragraphs = [];
            if (tip.title) {
              paragraphs.push(
                new Paragraph({
                  children: [new TextRun({ text: tip.title, bold: true, color: primaryColor, size: 24 })],
                  spacing: { before: 150, after: 100 }
                })
              );
            }
            if (tip.options && Array.isArray(tip.options)) {
              tip.options.forEach(opt => {
                paragraphs.push(
                  new Paragraph({
                    bullet: { level: 0 },
                    children: [
                      new TextRun({ text: opt.label + ' ', bold: true, color: secondaryColor }),
                      new TextRun({ text: opt.text })
                    ],
                    spacing: { after: 100 }
                  })
                );
              });
            }
            if (tip.text) {
              paragraphs.push(
                new Paragraph({
                  children: [new TextRun({ text: tip.text, italics: true })],
                  spacing: { after: 150 }
                })
              );
            }
            return paragraphs;
          }).flat(),

          new Paragraph({
            text: '',
            spacing: { before: 400 },
            pageBreakBefore: true
          }),

          // ==========================================
          // 4. COLAZIONE E SPUNTINI
          // ==========================================
          new Paragraph({
            text: 'COLAZIONE E SPUNTINI',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 300 },
            style: { run: { color: primaryColor, bold: true, size: 32 } }
          }),

          // Colazione
          new Paragraph({
            text: 'COLAZIONE (TUTTI I GIORNI)',
            heading: HeadingLevel.HEADING_2,
            style: { run: { color: secondaryColor, bold: true, size: 26 } },
            spacing: { before: 100, after: 100 }
          }),
          ...(planData.colazione_spuntini?.colazione || []).map(item =>
            new Paragraph({
              bullet: { level: 0 },
              children: [new TextRun({ text: item })],
              spacing: { after: 60 }
            })
          ),

          // Spuntino Mattina / Scuola
          new Paragraph({
            text: 'SPUNTINO SCUOLA / MATTINA',
            heading: HeadingLevel.HEADING_2,
            style: { run: { color: secondaryColor, bold: true, size: 26 } },
            spacing: { before: 240, after: 100 }
          }),
          ...(planData.colazione_spuntini?.spuntino_scuola || []).map(item =>
            new Paragraph({
              bullet: { level: 0 },
              children: [new TextRun({ text: item })],
              spacing: { after: 60 }
            })
          ),

          // Spuntino Pomeriggio
          new Paragraph({
            text: 'SPUNTINO POMERIDIANO',
            heading: HeadingLevel.HEADING_2,
            style: { run: { color: secondaryColor, bold: true, size: 26 } },
            spacing: { before: 240, after: 100 }
          }),
          ...(planData.colazione_spuntini?.spuntino_pomeridiano || []).map(item =>
            new Paragraph({
              bullet: { level: 0 },
              children: [new TextRun({ text: item })],
              spacing: { after: 60 }
            })
          ),

          new Paragraph({
            text: '',
            spacing: { before: 400 },
            pageBreakBefore: true
          }),

          // ==========================================
          // 5. NUTRIZIONE SPORTIVA & TIMING
          // ==========================================
          new Paragraph({
            text: 'NUTRIZIONE SPORTIVA & TIMING ALLENAMENTI',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 300 },
            style: { run: { color: primaryColor, bold: true, size: 32 } }
          }),

          new Paragraph({
            text: 'PRE-ALLENAMENTO (2h - 2.30h prima):',
            heading: HeadingLevel.HEADING_2,
            style: { run: { color: secondaryColor, bold: true, size: 24 } },
            spacing: { before: 100, after: 80 }
          }),
          new Paragraph({
            children: [new TextRun({ text: planData.sport_timing?.pre_allenamento || '' })],
            spacing: { after: 200 }
          }),

          new Paragraph({
            text: 'PRE-PARTITA (2h - 2.30h prima):',
            heading: HeadingLevel.HEADING_2,
            style: { run: { color: secondaryColor, bold: true, size: 24 } },
            spacing: { before: 100, after: 80 }
          }),
          new Paragraph({
            children: [new TextRun({ text: planData.sport_timing?.pre_partita || '' })],
            spacing: { after: 200 }
          }),

          new Paragraph({
            text: 'POST-ALLENAMENTO (Entro 30-60 min dal termine):',
            heading: HeadingLevel.HEADING_2,
            style: { run: { color: secondaryColor, bold: true, size: 24 } },
            spacing: { before: 100, after: 80 }
          }),
          ...(planData.sport_timing?.post_allenamento?.items || []).map(item =>
            new Paragraph({
              bullet: { level: 0 },
              children: [new TextRun({ text: item })],
              spacing: { after: 60 }
            })
          ),

          // ==========================================
          // 6. GIORNI DELLA SETTIMANA (LUNEDÌ - DOMENICA)
          // ==========================================
          ...(planData.days || []).map((day, idx) => {
            return [
              new Paragraph({
                text: '',
                spacing: { before: 300 },
                pageBreakBefore: true
              }),

              new Paragraph({
                text: `${day.day_name.toUpperCase()} - SCHEMA PASTI`,
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 200, after: 240 },
                style: { run: { color: primaryColor, bold: true, size: 32 } }
              }),

              // Tabella Pranzo & Cena
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  // Intestazione Pranzo
                  new TableRow({
                    children: [
                      new TableCell({
                        shading: { type: ShadingType.CLEAR, fill: primaryColor },
                        margins: { top: 120, bottom: 120, left: 160, right: 160 },
                        children: [
                          new Paragraph({
                            children: [new TextRun({ text: 'PRANZO', bold: true, color: 'FFFFFF', size: 24 })]
                          })
                        ]
                      })
                    ]
                  }),
                  // Contenuto Pranzo
                  new TableRow({
                    children: [
                      new TableCell({
                        margins: { top: 160, bottom: 160, left: 160, right: 160 },
                        children: [
                          ...(day.pranzo || []).map(p =>
                            new Paragraph({
                              bullet: { level: 0 },
                              children: [new TextRun({ text: p, size: 22 })],
                              spacing: { after: 40 }
                            })
                          ),
                          ...(day.pranzo_substitutions || []).map(sub =>
                            new Paragraph({
                              children: [new TextRun({ text: sub, italics: true, color: mutedTextColor, size: 20 })],
                              spacing: { before: 80, after: 40 }
                            })
                          )
                        ]
                      })
                    ]
                  }),
                  // Intestazione Cena
                  new TableRow({
                    children: [
                      new TableCell({
                        shading: { type: ShadingType.CLEAR, fill: secondaryColor },
                        margins: { top: 120, bottom: 120, left: 160, right: 160 },
                        children: [
                          new Paragraph({
                            children: [new TextRun({ text: 'CENA', bold: true, color: 'FFFFFF', size: 24 })]
                          })
                        ]
                      })
                    ]
                  }),
                  // Contenuto Cena
                  new TableRow({
                    children: [
                      new TableCell({
                        margins: { top: 160, bottom: 160, left: 160, right: 160 },
                        children: [
                          ...(day.cena || []).map(c =>
                            new Paragraph({
                              bullet: { level: 0 },
                              children: [new TextRun({ text: c, size: 22 })],
                              spacing: { after: 40 }
                            })
                          ),
                          ...(day.cena_substitutions || []).map(sub =>
                            new Paragraph({
                              children: [new TextRun({ text: sub, italics: true, color: mutedTextColor, size: 20 })],
                              spacing: { before: 80, after: 40 }
                            })
                          )
                        ]
                      })
                    ]
                  })
                ]
              }),

              // Trucco in cucina del giorno (se presente)
              day.tip
                ? new Paragraph({
                    children: [
                      new TextRun({ text: '💡 Trucco in cucina: ', bold: true, color: primaryColor }),
                      new TextRun({ text: day.tip, italics: true })
                    ],
                    spacing: { before: 200, after: 200 },
                    shading: { type: ShadingType.CLEAR, fill: 'F8FAFC' },
                    border: {
                      left: { style: BorderStyle.SINGLE, size: 12, color: primaryColor }
                    }
                  })
                : new Paragraph({ text: '', spacing: { after: 100 } })
            ];
          }).flat()
        ]
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  return blob;
}
