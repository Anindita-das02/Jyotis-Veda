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
GOLD_LIGHT = colors.HexColor("#FFFFFF")
GOLD_BORDER = colors.HexColor("#E2D3B0")
TEXT_DARK = colors.HexColor("#1A1A1E")
TEXT_MUTED = colors.HexColor("#5A554C")


def _styles():
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        name="JVBrand", fontSize=21, leading=25, alignment=0,
        fontName="Helvetica-Bold",
    ))
    styles.add(ParagraphStyle(
        name="JVSubtitle", fontSize=9.5, leading=13, alignment=0,
        textColor=GOLD_DARK, fontName="Helvetica-Bold",
    ))
    styles.add(ParagraphStyle(
        name="JVCitation", fontSize=7.5, leading=10.5, alignment=0,
        textColor=colors.HexColor("#6B655B"), fontName="Helvetica-Oblique",
    ))
    styles.add(ParagraphStyle(
        name="JVSection", fontSize=10, leading=13, spaceBefore=4,
        spaceAfter=3, textColor=GOLD_DARK, fontName="Helvetica-Bold",
    ))
    styles.add(ParagraphStyle(
        name="JVBody", fontSize=8.5, leading=12, textColor=TEXT_DARK,
    ))
    styles.add(ParagraphStyle(
        name="JVBodyBold", fontSize=9, leading=12.5, textColor=TEXT_DARK,
        fontName="Helvetica-Bold",
    ))
    styles.add(ParagraphStyle(
        name="JVBodyMuted", fontSize=8, leading=11, textColor=TEXT_MUTED,
    ))
    styles.add(ParagraphStyle(
        name="JVTableHead", fontSize=8.5, leading=11.5, textColor=GOLD_DARK,
        fontName="Helvetica-Bold", alignment=0,
    ))
    styles.add(ParagraphStyle(
        name="JVTableHeadCenter", fontSize=8.5, leading=11.5, textColor=GOLD_DARK,
        fontName="Helvetica-Bold", alignment=1,
    ))
    styles.add(ParagraphStyle(
        name="JVTableHeadRight", fontSize=8.5, leading=11.5, textColor=GOLD_DARK,
        fontName="Helvetica-Bold", alignment=2,
    ))
    styles.add(ParagraphStyle(
        name="JVTableCellCenter", fontSize=8.5, leading=11.5, textColor=TEXT_DARK,
        alignment=1,
    ))
    styles.add(ParagraphStyle(
        name="JVTableCellRight", fontSize=8.5, leading=11.5, textColor=TEXT_DARK,
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
        topMargin=10 * mm,
        bottomMargin=18 * mm,
        leftMargin=13 * mm,
        rightMargin=13 * mm,
        title="JyotishVeda Kundli Milan Report",
    )

    story = []

    # 1. Header Title & Brand with Logo Icon
    logo_candidates = [
        os.path.abspath(os.path.join(os.path.dirname(__file__), "jyotishveda_logo.png")),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "public", "jyotishveda_logo.png")),
        os.path.abspath(os.path.join("public", "jyotishveda_logo.png")),
        os.path.abspath("jyotishveda_logo.png"),
    ]
    logo_path = next((p for p in logo_candidates if os.path.exists(p)), None)

    brand_html = (
        '<b><font size="19" color="#111111">JYOTISH</font><font size="19" color="#B58328">VEDA</font></b><br/>'
        '<font size="9" color="#7E5F18"><b>VEDIC KUNDLI MILAN &amp; ASHTA KOOTA COMPATIBILITY CERTIFICATE</b></font><br/>'
        '<font size="7.5" color="#666666"><i>Calculated in accordance with Brihat Parashara Hora Shastra &amp; Classical Jyotish Sutras</i></font>'
    )
    brand_p = Paragraph(brand_html, ParagraphStyle(
        name="JVHeaderBlock",
        fontName="Helvetica-Bold",
        fontSize=17,
        leading=15,
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

    story.append(Spacer(1, 4.5 * mm))

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
                f"<font size=8.5 color='#7E5F18'><b>TOTAL COMPATIBILITY SCORE</b></font><br/>"
                f"<font size=18 color='#7E5F18'><b>{total:g} / {max_score:g} Gunas ({pct:.0f}%)</b></font><br/>"
                f"<font size=10 color='#1A1A1E'><b>{verdict_title.upper()}</b></font><br/>"
                f"<font size=8.2 color='#555555'><i>\"{summary_text[:190]}\"</i></font>",
                styles["ScoreCenter"]
            )
        ]
    ]
    score_table = Table(score_data, colWidths=[184 * mm])
    score_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FFFFFF")),
        ("BOX", (0, 0), (-1, -1), 0.8, GOLD_MAIN),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
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
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#FAF7F0")),
        ("LINEBELOW", (0, 0), (-1, -1), 0.4, colors.HexColor("#E5DCBE")),
        ("BOX", (0, 0), (-1, -1), 0.6, GOLD_BORDER),
        ("TOPPADDING", (0, 0), (-1, -1), 5.5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5.5),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]
    for r_i in range(1, len(rows)):
        if r_i % 2 == 0:
            t_style.append(("BACKGROUND", (0, r_i), (-1, r_i), colors.HexColor("#FAF8F2")))
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
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FFFFFF")),
        ("BOX", (0, 0), (-1, -1), 0.6, GOLD_BORDER),
        ("LINEBEFORE", (1, 0), (1, -1), 0.6, GOLD_BORDER),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LEFTPADDING", (0, 0), (-1, -1), 9),
        ("RIGHTPADDING", (0, 0), (-1, -1), 9),
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
        fontSize=8.2,
        leading=12,
        textColor=colors.HexColor("#3A3A3C"),
    )
    rem_table = Table([[
        Paragraph(f"<font size=9 color='#7E5F18'><b>AUSPICIOUS VEDIC REMEDIES &amp; MUHURAT</b></font><br/>{rem_lines}<br/><font size=7.8 color='#666666'><b>Muhurat Guidance:</b> {muhurat_str[:150]}</font>", rem_style)
    ]], colWidths=[184 * mm])
    rem_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FFFFFF")),
        ("BOX", (0, 0), (-1, -1), 0.6, GOLD_MAIN),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LEFTPADDING", (0, 0), (-1, -1), 9),
        ("RIGHTPADDING", (0, 0), (-1, -1), 9),
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
    story.append(Spacer(1, 3 * mm))

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
                f"<font size=8.5 color='#555555'>{s_desc[:150]}</font>",
                styles["JVBody"]
            ))

    elem_text = f"<b>Elemental Synergy ({elem_balance.get('score', 80)}%):</b><br/><font size=8.5 color='#555555'>{elem_balance.get('synergy', 'Harmonious elemental polarity')}.</font>"
    num_text = f"<b>Numerology Harmony ({num_milan.get('harmonyScore', 85)}%):</b><br/><font size=8.5 color='#555555'>{num_milan.get('description', 'Favorable psychic numbers')[:150]}</font>"

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
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FFFFFF")),
        ("BOX", (0, 0), (-1, -1), 0.6, GOLD_BORDER),
        ("LINEBEFORE", (1, 0), (1, -1), 0.6, GOLD_BORDER),
        ("LINEBELOW", (0, 0), (-1, 0), 0.6, GOLD_BORDER),
        ("TOPPADDING", (0, 0), (-1, -1), 9.5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 9.5),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
    ]))
    story.append(syn_table)
    story.append(Spacer(1, 7 * mm))

    # Daivajna Relationship Synthesis Section
    story.append(Paragraph("DAIVAJNA DEEP RELATIONSHIP SYNTHESIS", styles["JVSection"]))
    
    ai_overall = ai_synth.get("overall_compatibility") or "Harmonious celestial resonance across emotional, spiritual, and material domains."
    ai_psych = ai_synth.get("psychological_affinity") or "Strong intellectual rapport, fluid communication, and high mutual respect."
    ai_emot = ai_synth.get("emotional_resonance") or "Emotionally supportive dynamic with tender intuition and shared sensitivity."
    ai_karmic = ai_synth.get("karmic_bond") or "Favorable karmic alignment supporting longevity, spiritual growth, and shared destiny."
    ai_phys = ai_synth.get("physical_harmonization") or "Harmonious physical vitality, natural biological accord, and mutual fondness."
    ai_family = ai_synth.get("family_and_married_life") or "Auspicious planetary indicators for lasting domestic peace and family integration."
    ai_wealth = ai_synth.get("wealth_and_prosperity") or "Planetary trines indicate joint financial prosperity, abundance, and domestic bliss."
    ai_final = ai_synth.get("final_assessment") or f"A promising Vedic Kundli Milan for {p1_name} and {p2_name}. Practicing traditional remedies ensures enduring joy, prosperity, and blissful companionship."

    ai_strengths = ai_synth.get("major_strengths") or ["High mutual respect & commitment", "Strong emotional alignment", "Shared life vision"]
    ai_challenges = ai_synth.get("major_challenges") or ["Balancing communication during stressful cycles"]
    ai_conflict = ai_synth.get("conflict_resolution") or ["Practice open dialogue before major decisions"]

    str_bullets = "<br/>".join([f"• {s[:110]}" for s in ai_strengths[:3]])
    ch_bullets = "<br/>".join([f"• {c[:110]}" for c in ai_challenges[:2]])
    cr_bullets = "<br/>".join([f"• {r[:110]}" for r in ai_conflict[:2]])

    ai_grid_data = [
        [
            Paragraph(f"<b>Overall Compatibility:</b><br/><font size=8.5 color='#444444'>{ai_overall[:180]}</font>", styles["JVBody"]),
            Paragraph(f"<b>Psychological Affinity:</b><br/><font size=8.5 color='#444444'>{ai_psych[:180]}</font>", styles["JVBody"]),
        ],
        [
            Paragraph(f"<b>Emotional Resonance:</b><br/><font size=8.5 color='#444444'>{ai_emot[:180]}</font>", styles["JVBody"]),
            Paragraph(f"<b>Karmic Bond &amp; Destiny:</b><br/><font size=8.5 color='#444444'>{ai_karmic[:180]}</font>", styles["JVBody"]),
        ],
        [
            Paragraph(f"<b>Physical &amp; Bio Harmony:</b><br/><font size=8.5 color='#444444'>{ai_phys[:180]}</font>", styles["JVBody"]),
            Paragraph(f"<b>Family &amp; Wealth Prosperity:</b><br/><font size=8.5 color='#444444'>{ai_wealth[:180]}</font>", styles["JVBody"]),
        ],
        [
            Paragraph(f"<font color='#7E5F18'><b>Major Relationship Strengths:</b></font><br/><font size=8.2 color='#333333'>{str_bullets}</font>", styles["JVBody"]),
            Paragraph(f"<font color='#7E5F18'><b>Challenges &amp; Conflict Resolution:</b></font><br/><font size=8.2 color='#333333'>{ch_bullets}<br/>{cr_bullets}</font>", styles["JVBody"]),
        ],
    ]

    ai_table = Table(ai_grid_data, colWidths=[92 * mm, 92 * mm])
    ai_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FFFFFF")),
        ("BOX", (0, 0), (-1, -1), 0.6, GOLD_MAIN),
        ("LINEBELOW", (0, 0), (-1, -2), 0.4, GOLD_BORDER),
        ("LINEBEFORE", (1, 0), (1, -1), 0.4, GOLD_BORDER),
        ("TOPPADDING", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    story.append(ai_table)
    story.append(Spacer(1, 7 * mm))

    # Final Assessment Box
    final_box = Table([[
        Paragraph(
            f"<font size=10 color='#7E5F18'><b>DAIVAJNA FINAL ASSESSMENT &amp; BLESSINGS</b></font><br/>"
            f"<font size=9 color='#222222'><i>\"{ai_final[:280]}\"</i></font>",
            styles["ScoreCenter"]
        )
    ]], colWidths=[184 * mm])
    final_box.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FFFFFF")),
        ("BOX", (0, 0), (-1, -1), 0.7, GOLD_DARK),
        ("TOPPADDING", (0, 0), (-1, -1), 12),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
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


def generate_roadmap_report_pdf(payload: dict) -> bytes:
    """Builds a comprehensive 25-Year Vedic Destiny Roadmap & Life Blueprint PDF."""
    styles = _styles()
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        topMargin=12 * mm,
        bottomMargin=18 * mm,
        leftMargin=13 * mm,
        rightMargin=13 * mm,
        title="JyotishVeda 25-Year Vedic Destiny Roadmap",
    )

    story = []

    profile = payload.get("profile") or {}
    selected_horizon = (payload.get("selectedHorizon") or "0-5 Years").strip()
    raw_milestones = payload.get("roadmap") or payload.get("milestones") or []
    if selected_horizon and selected_horizon.lower() != "all":
        milestones = [
            m for m in raw_milestones 
            if (m.get("timeframe") or "").strip() == selected_horizon or
               (selected_horizon == "0-5 Years" and (m.get("timeframe") or "").strip() in ("0-12 Months", "1-3 Years", "0-5 Years")) or
               (selected_horizon == "5-10 Years" and (m.get("timeframe") or "").strip() in ("3-5 Years", "5-10 Years"))
        ]
        if not milestones:
            milestones = [m for m in raw_milestones if (m.get("timeframe") or "").strip() == selected_horizon] or raw_milestones
    else:
        milestones = raw_milestones

    chart_data = payload.get("chartData") or {}
    numerology = payload.get("numerology") or {}

    p_name = profile.get("fullName") or profile.get("name") or "Vedic Seeker"
    p_dob = profile.get("birthDate") or profile.get("dob") or "N/A"
    p_tob = profile.get("birthTime") or profile.get("tob") or ""
    p_place = profile.get("birthPlace") or profile.get("place") or "Global"

    asc_sign = chart_data.get("ascendant", {}).get("signName") or chart_data.get("ascendant", {}).get("signSanskrit") or "Vedic Lagna"
    moon_planet = next((p for p in chart_data.get("planets", []) if str(p.get("id", "")).lower() == "moon" or str(p.get("name", "")).lower() == "moon"), {})
    moon_sign = chart_data.get("moonSign") or moon_planet.get("signName") or "Chandra Rashi"
    nakshatra = moon_planet.get("nakshatra") or "Vedic Nakshatra"
    if moon_planet.get("pada"):
        nakshatra += f" (Pada {moon_planet.get('pada')})"

    dasha_list = chart_data.get("dashas", []) or chart_data.get("dashaPeriods", [])
    current_dasha_obj = next((d for d in dasha_list if d.get("isCurrent")), {})
    if current_dasha_obj and current_dasha_obj.get("planet"):
        active_dasha = f"{current_dasha_obj.get('planet')} Mahadasha"
    elif chart_data.get("currentDasha", {}).get("mahadasha"):
        active_dasha = f"{chart_data['currentDasha']['mahadasha']} Mahadasha"
    else:
        active_dasha = "Jupiter Mahadasha"

    mulank_val = f"Mulank {numerology.get('mulank')}" if numerology.get("mulank") else "Mulank -"
    bhagyank_val = f"Bhagyank {numerology.get('bhagyank')}" if numerology.get("bhagyank") else "Bhagyank -"

    # 1. Header Title & Brand
    logo_candidates = [
        os.path.abspath(os.path.join(os.path.dirname(__file__), "jyotishveda_logo.png")),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "public", "jyotishveda_logo.png")),
        os.path.abspath(os.path.join("public", "jyotishveda_logo.png")),
        os.path.abspath("jyotishveda_logo.png"),
    ]
    logo_path = next((p for p in logo_candidates if os.path.exists(p)), None)

    brand_cells = []
    if logo_path:
        brand_cells.append(Image(logo_path, width=16 * mm, height=16 * mm))
    else:
        brand_cells.append(Paragraph("<b>JV</b>", styles["JVBrand"]))

    brand_cells.append(
        Paragraph(
            "<font color='#1A1A1E'><b>JYOTISH</b></font><font color='#C9A050'><b>VEDA</b></font><br/>"
            f"<font size=8 color='#7E5F18'><b>25-YEAR VEDIC DESTINY ROADMAP &amp; LIFE BLUEPRINT ({selected_horizon})</b></font><br/>"
            f"<font size=6.8 color='#6E695F'><i>Synthesized through Vimshottari Mahadasha/Antardasha cycles &amp; planetary transits ({datetime.utcnow().year} – {datetime.utcnow().year + 25})</i></font>",
            styles["JVBrand"]
        )
    )

    header_table = Table([brand_cells], colWidths=[18 * mm, 166 * mm] if logo_path else [12 * mm, 172 * mm])
    header_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 3 * mm))

    # 2. Client Particulars Box
    client_box = [
        [
            Paragraph(
                f"<font size=7.5 color='#7E5F18'><b>CLIENT &amp; NATAL PARTICULARS</b></font><br/>"
                f"<font size=10 color='#1A1A1E'><b>{p_name}</b></font><br/>"
                f"<font size=7.2 color='#555555'>Born: {p_dob}{(' at ' + p_tob) if p_tob else ''} | {p_place}</font><br/>"
                f"<font size=7.2 color='#555555'>Active Dasha: <b>{active_dasha}</b></font>",
                styles["JVBody"]
            ),
            Paragraph(
                f"<font size=7.5 color='#7E5F18'><b>CELESTIAL &amp; NUMEROLOGICAL COORDINATES</b></font><br/>"
                f"<font size=8.5 color='#1A1A1E'><b>Lagna: {asc_sign} | Rashi: {moon_sign}</b></font><br/>"
                f"<font size=7.2 color='#555555'>Nakshatra: {nakshatra}</font><br/>"
                f"<font size=7.2 color='#555555'>Numerology: <b>{mulank_val}</b> | <b>{bhagyank_val}</b></font>",
                styles["JVBody"]
            )
        ]
    ]
    client_table = Table(client_box, colWidths=[92 * mm, 92 * mm])
    client_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FFFFFF")),
        ("BOX", (0, 0), (-1, -1), 0.6, GOLD_BORDER),
        ("LINEBEFORE", (1, 0), (1, -1), 0.6, GOLD_BORDER),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(client_table)
    story.append(Spacer(1, 3.5 * mm))

    def is_locked(tf, category):
        if tf in ("0-5 Years", "0-12 Months", "1-3 Years"):
            return False
        if tf in ("5-10 Years", "3-5 Years"):
            return category in ("Wealth", "Relationships")
        if tf == "10-15 Years":
            return category in ("Wealth", "Relationships", "Health")
        if tf in ("15-20 Years", "20-25 Years"):
            return True
        return False

    # Strictly filter out locked categories from PDF export
    unlocked_milestones = [
        m for m in milestones 
        if not is_locked((m.get("timeframe") or selected_horizon).strip(), m.get("category", "General"))
    ]

    # 3. Overview Arc Banner
    total_ms = len(unlocked_milestones)
    overview_box = [
        [
            Paragraph(
                f"<font size=8 color='#7E5F18'><b>25-YEAR DESTINY ARC OVERVIEW — {selected_horizon.upper()}</b></font><br/>"
                f"<font size=7.5 color='#444444'>Active Horizon: <b>{selected_horizon}</b> | Unlocked Milestones in Horizon: <b>{total_ms}</b> | Epochs: <b>5 Horizons (0–25 Yrs)</b></font>",
                styles["JVBody"]
            )
        ]
    ]
    overview_table = Table(overview_box, colWidths=[184 * mm])
    overview_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FAF7F0")),
        ("BOX", (0, 0), (-1, -1), 0.6, GOLD_MAIN),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(overview_table)
    story.append(Spacer(1, 4 * mm))

    # 4. Milestone Cards (Only Unlocked Milestones)
    story.append(Paragraph("STRATEGIC MILESTONES &amp; TIMELINE PREDICTIONS", styles["JVSection"]))

    if not unlocked_milestones:
        locked_msg_box = [
            [
                Paragraph(
                    f"<font size=8.5 color='#8C6D23'><b>[{selected_horizon.upper()}] CONSULTATION &amp; GATEWAY ROADMAP ACCESS</b></font><br/>"
                    f"<font size=7.5 color='#555555'>The astrological roadmap milestones for {selected_horizon} require comprehensive chart synthesis. Please unlock this tier in Consultations &amp; Gateway.</font>",
                    styles["JVBody"]
                )
            ]
        ]
        locked_msg_table = Table(locked_msg_box, colWidths=[184 * mm])
        locked_msg_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F9F7F1")),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#DFC896")),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ]))
        story.append(locked_msg_table)
        story.append(Spacer(1, 4 * mm))
    else:
        for idx, m in enumerate(unlocked_milestones):
            cat = m.get("category", "General")
            title = m.get("title", f"Vedic Destiny Phase {idx + 1}")
            timeframe = m.get("timeframe", selected_horizon)
            guidance = m.get("guidance") or "Comprehensive transit guidance and astrological timing."
            transits = m.get("favorableTransits") or "Favorable planetary aspect and Mahadasha support."
            remedy = m.get("remedialAction") or "Chant Gayatri Mantra & perform planetary seva."

            card_content = [
                [
                    Paragraph(
                        f"<font size=8 color='#7E5F18'><b>[{timeframe}] • {cat.upper()}</b></font><br/>"
                        f"<font size=9.5 color='#1A1A1E'><b>{title}</b></font><br/>"
                        f"<font size=7.8 color='#333333'>{guidance}</font><br/>"
                        f"<font size=7.2 color='#7E5F18'><b>Astrological Transit Window:</b></font> <font size=7.2 color='#555555'>{transits}</font><br/>"
                        f"<font size=7.2 color='#7E5F18'><b>Recommended Upaya / Sadhana:</b></font> <font size=7.2 color='#555555'>{remedy}</font>",
                        styles["JVBody"]
                    )
                ]
            ]
            card_table = Table(card_content, colWidths=[184 * mm])
            card_table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FCFBF8")),
                ("BOX", (0, 0), (-1, -1), 0.5, GOLD_BORDER),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ]))
            story.append(card_table)
            story.append(Spacer(1, 2.8 * mm))

    # Page Decorations (Watermark, Golden Borders, Footers)
    def _draw_roadmap_decorations(canvas, doc_):
        canvas.saveState()
        img_candidates = [
            os.path.abspath(os.path.join(os.path.dirname(__file__), "astrologer_bg.jpg")),
            os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "public", "astrologer_bg.jpg")),
            os.path.abspath(os.path.join("public", "astrologer_bg.jpg")),
            os.path.abspath("astrologer_bg.jpg"),
        ]
        img_path = next((p for p in img_candidates if os.path.exists(p)), None)
        if img_path:
            try:
                canvas.setFillAlpha(0.08)
                canvas.drawImage(img_path, 0, 0, width=210 * mm, height=297 * mm, preserveAspectRatio=False, mask='auto')
            except Exception:
                pass

        # Outer Decorative Golden Double Border
        canvas.setFillAlpha(1.0)
        canvas.setStrokeColor(GOLD_MAIN)
        canvas.setLineWidth(1.1)
        canvas.rect(8 * mm, 8 * mm, (210 - 16) * mm, (297 - 16) * mm)
        canvas.setLineWidth(0.35)
        canvas.rect(10 * mm, 10 * mm, (210 - 20) * mm, (297 - 20) * mm)

        # Corner Rosettes
        canvas.setFillColor(GOLD_MAIN)
        canvas.circle(10 * mm, 10 * mm, 1.2 * mm, fill=1, stroke=0)
        canvas.circle((210 - 10) * mm, 10 * mm, 1.2 * mm, fill=1, stroke=0)
        canvas.circle(10 * mm, (297 - 10) * mm, 1.2 * mm, fill=1, stroke=0)
        canvas.circle((210 - 10) * mm, (297 - 10) * mm, 1.2 * mm, fill=1, stroke=0)

        # Footer Divider Line
        canvas.setStrokeColor(GOLD_BORDER)
        canvas.setLineWidth(0.4)
        canvas.line(13 * mm, 16 * mm, (210 - 13) * mm, 16 * mm)

        # Footer Details (Only Generation Date and Page Number)
        gen_date = datetime.utcnow().strftime("%d %b %Y")
        canvas.setFont("Helvetica", 7.5)
        canvas.setFillColor(colors.HexColor("#666666"))
        canvas.drawString(14 * mm, 11.5 * mm, f"Generated: {gen_date}")
        canvas.drawRightString((210 - 14) * mm, 11.5 * mm, f"Page {doc_.page}")

        canvas.restoreState()

    doc.build(story, onFirstPage=_draw_roadmap_decorations, onLaterPages=_draw_roadmap_decorations)
    return buffer.getvalue()