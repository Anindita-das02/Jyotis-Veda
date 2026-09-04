import io
import os
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
)

GOLD_DARK = colors.HexColor("#7E5F18")
GOLD_MAIN = colors.HexColor("#C9A050")
GOLD_LIGHT = colors.HexColor("#FCF9F2")
GOLD_BORDER = colors.HexColor("#E2D3B0")
TEXT_DARK = colors.HexColor("#1A1A1E")
TEXT_MUTED = colors.HexColor("#5A554C")


def _styles():
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        name="JVBrand", fontSize=22, leading=26, alignment=0,
        fontName="Helvetica-Bold",
    ))
    styles.add(ParagraphStyle(
        name="JVSubtitle", fontSize=9, leading=12, alignment=0,
        textColor=GOLD_DARK, fontName="Helvetica-Bold",
    ))
    styles.add(ParagraphStyle(
        name="JVCitation", fontSize=7.5, leading=10, alignment=0,
        textColor=colors.HexColor("#6B655B"), fontName="Helvetica-Oblique",
    ))
    styles.add(ParagraphStyle(
        name="JVSection", fontSize=10, leading=13, spaceBefore=4,
        spaceAfter=3, textColor=GOLD_DARK, fontName="Helvetica-Bold",
    ))
    styles.add(ParagraphStyle(
        name="JVBody", fontSize=8.5, leading=11.5, textColor=TEXT_DARK,
    ))
    styles.add(ParagraphStyle(
        name="JVBodyBold", fontSize=9, leading=12, textColor=TEXT_DARK,
        fontName="Helvetica-Bold",
    ))
    styles.add(ParagraphStyle(
        name="JVBodyMuted", fontSize=8, leading=10.5, textColor=TEXT_MUTED,
    ))
    styles.add(ParagraphStyle(
        name="JVTableHead", fontSize=8.5, leading=11, textColor=GOLD_DARK,
        fontName="Helvetica-Bold", alignment=0,
    ))
    styles.add(ParagraphStyle(
        name="JVTableHeadCenter", fontSize=8.5, leading=11, textColor=GOLD_DARK,
        fontName="Helvetica-Bold", alignment=1,
    ))
    styles.add(ParagraphStyle(
        name="JVTableHeadRight", fontSize=8.5, leading=11, textColor=GOLD_DARK,
        fontName="Helvetica-Bold", alignment=2,
    ))
    styles.add(ParagraphStyle(
        name="JVTableCellCenter", fontSize=8.5, leading=11, textColor=TEXT_DARK,
        alignment=1,
    ))
    styles.add(ParagraphStyle(
        name="JVTableCellRight", fontSize=9, leading=11.5, textColor=GOLD_DARK,
        fontName="Helvetica-Bold", alignment=2,
    ))
    return styles


def generate_match_report_pdf(report: dict) -> bytes:
    """Builds an official Vedic Kundli Milan Certificate
    with full-page watermark background, brand logo, and 8 Koota breakdown."""
    styles = _styles()
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        topMargin=12 * mm,
        bottomMargin=22 * mm,
        leftMargin=13 * mm,
        rightMargin=13 * mm,
        title="JyotishVeda Kundli Milan Report",
    )

    story = []

    # 1. Header Title & Brand with Logo Icon (matching Image 2)
    logo_candidates = [
        os.path.abspath(os.path.join(os.path.dirname(__file__), "jyotishveda_logo.png")),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "public", "jyotishveda_logo.png")),
        os.path.abspath(os.path.join("public", "jyotishveda_logo.png")),
        os.path.abspath("jyotishveda_logo.png"),
    ]
    logo_path = next((p for p in logo_candidates if os.path.exists(p)), None)

    brand_html = (
        '<b><font size="20" color="#111111">JYOTISH</font><font size="20" color="#B58328">VEDA</font></b><br/>'
        '<font size="8.5" color="#7E5F18"><b>VEDIC KUNDLI MILAN &amp; ASHTA KOOTA COMPATIBILITY CERTIFICATE</b></font><br/>'
        '<font size="7" color="#666666"><i>Calculated in accordance with Brihat Parashara Hora Shastra &amp; Classical Jyotish Sutras</i></font>'
    )
    brand_p = Paragraph(brand_html, ParagraphStyle(
        name="JVHeaderBlock",
        fontName="Helvetica-Bold",
        fontSize=18,
        leading=16,
        alignment=0,
    ))

    if logo_path:
        logo_img = Image(logo_path, width=16 * mm, height=16 * mm)
        header_table = Table([[logo_img, brand_p]], colWidths=[18 * mm, 166 * mm])
        header_table.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("TOPPADDING", (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ]))
        story.append(header_table)
    else:
        story.append(brand_p)

    story.append(Spacer(1, 4 * mm))

    # 2. Couple Information Box (Partner 1 & Partner 2)
    p1_name = str(report.get("partner1_name", "Partner 1"))
    p2_name = str(report.get("partner2_name", "Partner 2"))
    p1_dob = str(report.get("partner1_birth_date", "N/A"))
    p2_dob = str(report.get("partner2_birth_date", "N/A"))
    p1_time = str(report.get("partner1_birth_time", ""))
    p2_time = str(report.get("partner2_birth_time", ""))
    p1_place = str(report.get("partner1_birth_place", ""))
    p2_place = str(report.get("partner2_birth_place", ""))

    p1_extra = f"Born: {p1_dob}" + (f" at {p1_time}" if p1_time else "") + (f", {p1_place}" if p1_place else "")
    p2_extra = f"Born: {p2_dob}" + (f" at {p2_time}" if p2_time else "") + (f", {p2_place}" if p2_place else "")

    couple_data = [
        [
            Paragraph(f"<font size=8.5 color='#7E5F18'><b>GROOM / PARTNER A</b></font><br/><font size=11.5 color='#1A1A1E'><b>{p1_name}</b></font><br/><font size=8 color='#555555'>{p1_extra}</font>", styles["JVBody"]),
            Paragraph(f"<font size=8.5 color='#7E5F18'><b>BRIDE / PARTNER B</b></font><br/><font size=11.5 color='#1A1A1E'><b>{p2_name}</b></font><br/><font size=8 color='#555555'>{p2_extra}</font>", styles["JVBody"]),
        ]
    ]
    couple_table = Table(couple_data, colWidths=[92 * mm, 92 * mm])
    couple_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), GOLD_LIGHT),
        ("BOX", (0, 0), (-1, -1), 0.6, GOLD_BORDER),
        ("LINEBEFORE", (1, 0), (1, -1), 0.6, GOLD_BORDER),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
    ]))
    story.append(couple_table)
    story.append(Spacer(1, 4.5 * mm))

    # 3. Total Compatibility Score Banner
    total = float(report.get("total_score", 0))
    max_score = float(report.get("max_score", 36))
    pct = (total / max_score * 100) if max_score > 0 else 0

    report_json = report.get("report_json") or {}
    verdict_title = report_json.get("verdictTitle") or ("AUSPICIOUS MATCH" if total >= 18 else "AVERAGE MATCH")
    summary_text = report_json.get("summary") or "Vedic synastry points calculated across Moon Nakshatras."

    score_data = [
        [
            Paragraph(
                f"<font size=9 color='#7E5F18'><b>TOTAL COMPATIBILITY SCORE</b></font><br/>"
                f"<font size=18.5 color='#7E5F18'><b>{total:g} / {max_score:g} Gunas ({pct:.0f}%)</b></font><br/>"
                f"<font size=10.5 color='#1A1A1E'><b>{verdict_title.upper()}</b></font><br/>"
                f"<font size=8 color='#555555'><i>\"{summary_text[:190]}\"</i></font>",
                ParagraphStyle(name="ScoreCenter", parent=styles["JVBody"], alignment=1, leading=14)
            )
        ]
    ]
    score_table = Table(score_data, colWidths=[184 * mm])
    score_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FEFAF0")),
        ("BOX", (0, 0), (-1, -1), 0.8, GOLD_MAIN),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(score_table)
    story.append(Spacer(1, 4.5 * mm))

    # 4. Ashta Koota Points Breakdown Table
    story.append(Paragraph("ASHTA KOOTA POINTS BREAKDOWN", styles["JVSection"]))
    kootas = report_json.get("kootas") or []
    
    rows = [[
        Paragraph("<b>Koota</b>", styles["JVTableHead"]),
        Paragraph("<b>Significance</b>", styles["JVTableHead"]),
        Paragraph(f"<b>{p1_name.split()[0]}</b>", styles["JVTableHeadCenter"]),
        Paragraph(f"<b>{p2_name.split()[0]}</b>", styles["JVTableHeadCenter"]),
        Paragraph("<b>Points</b>", styles["JVTableHeadRight"]),
    ]]

    if isinstance(kootas, list) and kootas:
        for idx, k in enumerate(kootas):
            k_name = str(k.get("name", ""))
            k_area = str(k.get("area", k.get("description", "")))[:45]
            p1_v = str(k.get("p1Value", "-"))
            p2_v = str(k.get("p2Value", "-"))
            score_v = float(k.get("obtainedPoints", k.get("score", 0)))
            max_v = float(k.get("maxPoints", k.get("max", 0)))
            pts_text = f"<b>{score_v:g} / {max_v:g}</b>"

            pts_style = ParagraphStyle(
                name=f"Pts_{idx}",
                parent=styles["JVTableCellRight"],
                textColor=GOLD_DARK,
            )

            rows.append([
                Paragraph(f"<b>{k_name}</b>", styles["JVBodyBold"]),
                Paragraph(k_area, styles["JVBodyMuted"]),
                Paragraph(p1_v, styles["JVTableCellCenter"]),
                Paragraph(p2_v, styles["JVTableCellCenter"]),
                Paragraph(pts_text, pts_style),
            ])

    koota_table = Table(rows, colWidths=[33 * mm, 57 * mm, 35 * mm, 35 * mm, 24 * mm])
    t_style = [
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F3ECDA")),
        ("LINEBELOW", (0, 0), (-1, -1), 0.4, colors.HexColor("#E5DCBE")),
        ("BOX", (0, 0), (-1, -1), 0.6, GOLD_BORDER),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]
    for r_i in range(1, len(rows)):
        if r_i % 2 == 0:
            t_style.append(("BACKGROUND", (0, r_i), (-1, r_i), colors.HexColor("#FCFAF5")))
    koota_table.setStyle(TableStyle(t_style))
    story.append(koota_table)
    story.append(Spacer(1, 4.5 * mm))

    # 5. Critical Dosha & Vitality Assessment
    story.append(Paragraph("CRITICAL DOSHA &amp; VITALITY ASSESSMENT", styles["JVSection"]))
    manglik = report_json.get("manglik") or {}
    m_verdict = manglik.get("verdict") or report.get("manglik_status") or "Non-Manglik"
    m_exp = manglik.get("explanation") or manglik.get("conclusion") or "Planetary Kuja influence analyzed between both birth charts."
    
    nadi = report_json.get("nadiDosha") or {}
    bhakoot = report_json.get("bhakootDosha") or {}
    vitality_text = f"Nadi: {nadi.get('reason', 'Balanced')}. Bhakoot: {bhakoot.get('reason', 'Auspicious harmony')}."

    dosha_data = [
        [
            Paragraph(f"<b>Manglik (Kuja) Dosha:</b><br/><font size=8.5 color='#7E5F18'><b>Verdict: {m_verdict}</b></font><br/><font size=8 color='#555555'>{m_exp[:150]}</font>", styles["JVBody"]),
            Paragraph(f"<b>Nadi &amp; Bhakoot Vitality:</b><br/><font size=8 color='#555555'>{vitality_text[:170]}</font>", styles["JVBody"]),
        ]
    ]
    dosha_table = Table(dosha_data, colWidths=[92 * mm, 92 * mm])
    dosha_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FAF7F0")),
        ("BOX", (0, 0), (-1, -1), 0.6, GOLD_BORDER),
        ("LINEBEFORE", (1, 0), (1, -1), 0.6, GOLD_BORDER),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    story.append(dosha_table)
    story.append(Spacer(1, 4.5 * mm))

    # 6. Auspicious Remedies Section
    remedies = report_json.get("remedies") or [
        "Perform Joint Gauri-Shankar Puja on Shukla Paksha Mondays to evoke divine marital grace.",
        "Chant the sacred Shukra Beej Mantra (Om Shum Shukraya Namaha) for enduring sweetness.",
        "Light a pure cow-ghee lamp during sunset on Thursdays for spiritual harmony."
    ]
    rem_lines = "<br/>".join([f"{i+1}. {r[:150]}" for i, r in enumerate(remedies[:3])])
    
    rem_style = ParagraphStyle(
        name="JVRemedies",
        parent=styles["JVBody"],
        fontSize=8.2,
        leading=12,
        textColor=colors.HexColor("#3A3A3C"),
    )
    rem_table = Table([[
        Paragraph(f"<font size=8.8 color='#7E5F18'><b>AUSPICIOUS VEDIC REMEDIES &amp; GUIDANCE</b></font><br/>{rem_lines}", rem_style)
    ]], colWidths=[184 * mm])
    rem_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FEFCF7")),
        ("BOX", (0, 0), (-1, -1), 0.6, GOLD_MAIN),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(rem_table)

    # 7. Decorative Canvas Decorator: Full Page Watermark + Borders + Raised Footer
    def _draw_page_decorations(canvas, doc_):
        canvas.saveState()
        
        # 1. Full Page Background Astrologer / Sage Image Watermark
        img_candidates = [
            os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "public", "astrologer_bg.jpg")),
            os.path.abspath(os.path.join("public", "astrologer_bg.jpg")),
            os.path.abspath("astrologer_bg.jpg"),
        ]
        img_path = next((p for p in img_candidates if os.path.exists(p)), None)
        
        if img_path:
            try:
                canvas.setFillAlpha(0.09)
                # Full page watermark across the entire 210mm x 297mm page
                canvas.drawImage(
                    img_path,
                    0,
                    0,
                    width=210 * mm,
                    height=297 * mm,
                    preserveAspectRatio=False,
                    mask='auto'
                )
            except Exception:
                pass

        # Outer Decorative Golden Double Border
        canvas.setFillAlpha(1.0)
        canvas.setStrokeColor(GOLD_MAIN)
        canvas.setLineWidth(1.2)
        canvas.rect(8 * mm, 8 * mm, (210 - 16) * mm, (297 - 16) * mm)
        canvas.setLineWidth(0.4)
        canvas.rect(10 * mm, 10 * mm, (210 - 20) * mm, (297 - 20) * mm)

        # Corner Golden Rosettes
        canvas.setFillColor(GOLD_MAIN)
        canvas.circle(10 * mm, 10 * mm, 1.2 * mm, fill=1, stroke=0)
        canvas.circle((210 - 10) * mm, 10 * mm, 1.2 * mm, fill=1, stroke=0)
        canvas.circle(10 * mm, (297 - 10) * mm, 1.2 * mm, fill=1, stroke=0)
        canvas.circle((210 - 10) * mm, (297 - 10) * mm, 1.2 * mm, fill=1, stroke=0)

        # Raised Footer Divider Line
        canvas.setStrokeColor(GOLD_BORDER)
        canvas.setLineWidth(0.5)
        canvas.line(13 * mm, 19 * mm, (210 - 13) * mm, 19 * mm)

        # Raised Footer Details (comfortably positioned above the bottom border)
        canvas.setFont("Helvetica", 7)
        canvas.setFillColor(colors.HexColor("#666666"))
        cert_id = f"JV-KM-{datetime.utcnow().strftime('%Y%m%d')}-{report.get('id', 'CERT')[:6].upper()}"
        canvas.drawString(14 * mm, 15 * mm, f"Certificate ID: {cert_id}  |  Generated: {datetime.utcnow().strftime('%d %B %Y')}")
        canvas.drawString(14 * mm, 12 * mm, "Certified via JyotishVeda Mathematical AstroEngine & Classical Ephemeris")

        canvas.setFont("Helvetica-Bold", 8)
        canvas.setFillColor(GOLD_DARK)
        canvas.drawRightString((210 - 14) * mm, 15 * mm, "DAIVAJNA ASTROLOGICAL SEAL")
        canvas.setFont("Helvetica", 6.5)
        canvas.setFillColor(colors.HexColor("#777777"))
        canvas.drawRightString((210 - 14) * mm, 12 * mm, "Digitally Verified & Certified")

        canvas.restoreState()

    doc.build(story, onFirstPage=_draw_page_decorations)
    return buffer.getvalue()