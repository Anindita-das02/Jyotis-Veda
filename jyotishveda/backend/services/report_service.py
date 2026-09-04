import io
import os
import json
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak
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
        name="JVTableCellRight", fontSize=8.5, leading=11, textColor=TEXT_DARK,
        alignment=2, fontName="Helvetica-Bold",
    ))
    styles.add(ParagraphStyle(
        name="ScoreCenter", parent=styles["JVBody"], alignment=1, leading=14,
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
                styles["ScoreCenter"]
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

    # 6. Auspicious Remedies & Muhurat Section
    remedies = report_json.get("remedies") or [
        "Perform Joint Gauri-Shankar Puja on Shukla Paksha Mondays to evoke divine marital grace.",
        "Chant the sacred Shukra Beej Mantra (Om Shum Shukraya Namaha) for enduring sweetness.",
        "Light a pure cow-ghee lamp during sunset on Thursdays for spiritual harmony."
    ]
    rem_lines = "<br/>".join([f"{i+1}. {r[:140]}" for i, r in enumerate(remedies[:3])])
    muhurat_str = report_json.get("auspiciousMuhuratAdvice") or "Auspicious wedding & partnership dates ideal during Shukla Paksha under Rohini, Uttara Phalguni, or Revati Nakshatras."
    
    rem_style = ParagraphStyle(
        name="JVRemedies",
        parent=styles["JVBody"],
        fontSize=8,
        leading=11.5,
        textColor=colors.HexColor("#3A3A3C"),
    )
    rem_table = Table([[
        Paragraph(f"<font size=8.5 color='#7E5F18'><b>AUSPICIOUS VEDIC REMEDIES &amp; MUHURAT</b></font><br/>{rem_lines}<br/><font size=7.5 color='#666666'><b>Muhurat Guidance:</b> {muhurat_str[:150]}</font>", rem_style)
    ]], colWidths=[184 * mm])
    rem_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FEFCF7")),
        ("BOX", (0, 0), (-1, -1), 0.6, GOLD_MAIN),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(rem_table)

    # ============================================================
    # PAGE 2: WESTERN SYNASTRY, ELEMENTS & AI RELATIONSHIP COUNSEL
    # ============================================================
    synastry_list = report_json.get("synastry") or []
    elem_balance = report_json.get("elementalBalance") or {}
    num_milan = report_json.get("numerologyMilan") or {}
    ai_synth = report_json.get("ai_synthesis") or report.get("ai_synthesis") or {}
    if isinstance(ai_synth, str):
        try:
            ai_synth = json.loads(ai_synth)
        except Exception:
            ai_synth = {}

    story.append(PageBreak())

    # Page 2 Header
    p2_hdr = Paragraph(
        '<b><font size="14" color="#111111">JYOTISH</font><font size="14" color="#B58328">VEDA</font></b> '
        '<font size="10" color="#7E5F18"><b>• WESTERN SYNASTRY, ELEMENTS &amp; AI COUNSEL</b></font><br/>'
        f'<font size=8 color="#555555">Comprehensive Cosmic Alignment Dossier for {p1_name} &amp; {p2_name}</font>',
        styles["ScoreCenter"]
    )
    story.append(p2_hdr)
    story.append(Spacer(1, 3.5 * mm))

    # Western Synastry & Elements Section
    story.append(Paragraph("WESTERN SYNASTRY &amp; COSMIC ELEMENTS", styles["JVSection"]))
    
    syn_rows = []
    if synastry_list and isinstance(synastry_list, list):
        for s in synastry_list[:3]:
            s_title = s.get("title", "Aspect")
            s_planets = s.get("planets", "")
            s_score = s.get("harmonyScore", 80)
            s_verdict = s.get("verdict", "")
            s_desc = s.get("description", "")
            syn_rows.append(Paragraph(
                f"<b>{s_title} ({s_planets}):</b> <font color='#7E5F18'><b>{s_score}% • {s_verdict}</b></font><br/>"
                f"<font size=7.5 color='#555555'>{s_desc[:120]}</font>",
                styles["JVBody"]
            ))

    elem_text = f"<b>Elemental Synergy ({elem_balance.get('score', 80)}%):</b> {elem_balance.get('synergy', 'Harmonious elemental polarity')}."
    num_text = f"<b>Numerology Harmony ({num_milan.get('harmonyScore', 85)}%):</b> {num_milan.get('description', 'Favorable psychic numbers')[:120]}."

    syn_table_data = [
        [
            syn_rows[0] if len(syn_rows) > 0 else Paragraph(elem_text, styles["JVBody"]),
            syn_rows[1] if len(syn_rows) > 1 else Paragraph(num_text, styles["JVBody"]),
        ],
        [
            Paragraph(elem_text, styles["JVBody"]),
            Paragraph(num_text, styles["JVBody"]),
        ]
    ]
    syn_table = Table(syn_table_data, colWidths=[92 * mm, 92 * mm])
    syn_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FAF7F0")),
        ("BOX", (0, 0), (-1, -1), 0.6, GOLD_BORDER),
        ("LINEBEFORE", (1, 0), (1, -1), 0.6, GOLD_BORDER),
        ("LINEBELOW", (0, 0), (-1, 0), 0.6, GOLD_BORDER),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
    ]))
    story.append(syn_table)
    story.append(Spacer(1, 3.5 * mm))

    # AI Daivajna Relationship Synthesis Section
    story.append(Paragraph("AI DAIVAJNA DEEP RELATIONSHIP SYNTHESIS", styles["JVSection"]))
    
    ai_overall = ai_synth.get("overall_compatibility") or "Harmonious celestial resonance across emotional and material domains."
    ai_psych = ai_synth.get("psychological_affinity") or "Strong intellectual rapport and fluid communication."
    ai_emot = ai_synth.get("emotional_resonance") or "Emotionally supportive dynamic with high mutual respect."
    ai_karmic = ai_synth.get("karmic_bond") or "Favorable karmic alignment supporting longevity and shared destiny."
    ai_phys = ai_synth.get("physical_harmonization") or "Harmonious physical vitality and mutual instinctual care."
    ai_wealth = ai_synth.get("wealth_and_prosperity") or "Planetary trines indicate joint prosperity and domestic bliss."
    ai_final = ai_synth.get("final_assessment") or f"A promising Vedic Kundli Milan. {p1_name} and {p2_name} will enjoy a flourishing and prosperous companionship."

    ai_strengths = ai_synth.get("major_strengths") or ["High mutual respect & commitment", "Strong emotional alignment"]
    ai_challenges = ai_synth.get("major_challenges") or ["Balancing communication during stressful cycles"]
    ai_conflict = ai_synth.get("conflict_resolution") or ["Practice open dialogue before major decisions"]

    str_bullets = "<br/>".join([f"• {s[:100]}" for s in ai_strengths[:3]])
    ch_bullets = "<br/>".join([f"• {c[:100]}" for c in ai_challenges[:2]])
    cr_bullets = "<br/>".join([f"• {r[:100]}" for r in ai_conflict[:2]])

    ai_grid_data = [
        [
            Paragraph(f"<b>Overall Compatibility:</b><br/><font size=7.8 color='#555555'>{ai_overall[:160]}</font>", styles["JVBody"]),
            Paragraph(f"<b>Psychological Affinity:</b><br/><font size=7.8 color='#555555'>{ai_psych[:160]}</font>", styles["JVBody"]),
        ],
        [
            Paragraph(f"<b>Emotional Resonance:</b><br/><font size=7.8 color='#555555'>{ai_emot[:160]}</font>", styles["JVBody"]),
            Paragraph(f"<b>Karmic Bond &amp; Destiny:</b><br/><font size=7.8 color='#555555'>{ai_karmic[:160]}</font>", styles["JVBody"]),
        ],
        [
            Paragraph(f"<font color='#1B7A43'><b>Major Relationship Strengths:</b></font><br/><font size=7.5 color='#333333'>{str_bullets}</font>", styles["JVBody"]),
            Paragraph(f"<font color='#B56A00'><b>Challenges &amp; Conflict Resolution:</b></font><br/><font size=7.5 color='#333333'>{ch_bullets}<br/>{cr_bullets}</font>", styles["JVBody"]),
        ],
    ]

    ai_table = Table(ai_grid_data, colWidths=[92 * mm, 92 * mm])
    ai_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FEFAF0")),
        ("BOX", (0, 0), (-1, -1), 0.6, GOLD_MAIN),
        ("LINEBELOW", (0, 0), (-1, -2), 0.4, GOLD_BORDER),
        ("LINEBEFORE", (1, 0), (1, -1), 0.4, GOLD_BORDER),
        ("TOPPADDING", (0, 0), (-1, -1), 4.5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4.5),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    story.append(ai_table)
    story.append(Spacer(1, 3.5 * mm))

    # AI Final Assessment Box
    final_box = Table([[
        Paragraph(
            f"<font size=8.5 color='#7E5F18'><b>AI DAIVAJNA FINAL ASSESSMENT &amp; BLESSINGS</b></font><br/>"
            f"<font size=7.8 color='#222222'><i>\"{ai_final[:220]}\"</i></font>",
            styles["ScoreCenter"]
        )
    ]], colWidths=[184 * mm])
    final_box.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FDF7E7")),
        ("BOX", (0, 0), (-1, -1), 0.7, GOLD_DARK),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(final_box)

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
        cert_id = f"JV-KM-{datetime.utcnow().strftime('%Y%m%d')}-{str(report.get('id', 'CERT'))[:6].upper()}"
        canvas.drawString(14 * mm, 15 * mm, f"Certificate ID: {cert_id}  |  Generated: {datetime.utcnow().strftime('%d %B %Y')}")
        canvas.drawString(14 * mm, 12 * mm, "Certified via JyotishVeda Mathematical AstroEngine & Classical Ephemeris")

        canvas.setFont("Helvetica-Bold", 8)
        canvas.setFillColor(GOLD_DARK)
        canvas.drawRightString((210 - 14) * mm, 15 * mm, "DAIVAJNA ASTROLOGICAL SEAL")
        canvas.setFont("Helvetica", 6.5)
        canvas.setFillColor(colors.HexColor("#777777"))
        canvas.drawRightString((210 - 14) * mm, 12 * mm, f"Page {doc_.page} | Digitally Verified & Certified")

        canvas.restoreState()

    doc.build(story, onFirstPage=_draw_page_decorations, onLaterPages=_draw_page_decorations)
    return buffer.getvalue()