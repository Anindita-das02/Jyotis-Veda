import io
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
)

GOLD = colors.HexColor("#8C6D23")
DARK = colors.HexColor("#1A1A1A")


def _styles():
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        name="JVTitle", fontSize=20, leading=24, alignment=1,
        textColor=GOLD, spaceAfter=4, fontName="Helvetica-Bold",
    ))
    styles.add(ParagraphStyle(
        name="JVSubtitle", fontSize=10, leading=14, alignment=1,
        textColor=colors.grey, spaceAfter=14,
    ))
    styles.add(ParagraphStyle(
        name="JVSection", fontSize=13, leading=16, spaceBefore=14,
        spaceAfter=6, textColor=GOLD, fontName="Helvetica-Bold",
    ))
    styles.add(ParagraphStyle(
        name="JVBody", fontSize=9.5, leading=14, textColor=DARK,
    ))
    return styles


def generate_match_report_pdf(report: dict) -> bytes:
    """report is the full matchmaking_reports row (dict), with report_json
    already parsed into a Python dict. Builds a real PDF, page numbers
    included, from that persisted data — nothing here is invented."""
    styles = _styles()
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        topMargin=20 * mm, bottomMargin=18 * mm,
        leftMargin=18 * mm, rightMargin=18 * mm,
        title="JyotishVeda Kundli Milan Report",
    )

    story = []
    story.append(Paragraph("JYOTISHVEDA", styles["JVTitle"]))
    story.append(Paragraph(
        "Official Vedic Kundli Milan &amp; Ashta Koota Compatibility Report",
        styles["JVSubtitle"],
    ))

    generated = datetime.utcnow().strftime("%d %B %Y, %H:%M UTC")
    header_data = [
        ["Partner 1", report["partner1_name"], "Partner 2", report["partner2_name"]],
        ["Birth Date", str(report["partner1_birth_date"]), "Birth Date", str(report["partner2_birth_date"])],
        ["Generated", generated, "Manglik Status", report.get("manglik_status") or "N/A"],
    ]
    header_table = Table(header_data, colWidths=[80, 130, 80, 130])
    header_table.setStyle(TableStyle([
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("TEXTCOLOR", (0, 0), (0, -1), GOLD),
        ("TEXTCOLOR", (2, 0), (2, -1), GOLD),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("LINEBELOW", (0, 0), (-1, -1), 0.4, colors.lightgrey),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 10))

    total = float(report["total_score"])
    max_score = float(report["max_score"])
    story.append(Paragraph("Compatibility Score", styles["JVSection"]))
    score_table = Table([[f"{total:g} / {max_score:g}", f"{(total / max_score * 100):.1f}%"]],
                         colWidths=[210, 210])
    score_table.setStyle(TableStyle([
        ("FONTSIZE", (0, 0), (-1, -1), 16),
        ("FONTNAME", (0, 0), (-1, -1), "Helvetica-Bold"),
        ("TEXTCOLOR", (0, 0), (-1, -1), GOLD),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("BOX", (0, 0), (-1, -1), 0.75, colors.lightgrey),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
    ]))
    story.append(score_table)

    report_json = report.get("report_json") or {}

    verdict_title = report_json.get("verdictTitle")
    verdict_desc = report_json.get("verdictDescription")
    if verdict_title or verdict_desc:
        story.append(Paragraph(f"Verdict: {verdict_title or 'Analysis'}", styles["JVSection"]))
        if verdict_desc:
            story.append(Paragraph(verdict_desc, styles["JVBody"]))

    kootas = report_json.get("kootas")
    if isinstance(kootas, list) and kootas:
        story.append(Paragraph("Ashta Koota Analysis", styles["JVSection"]))
        rows = [["Koota", "Points", "Max", "Notes"]]
        for k in kootas:
            # Wrap the notes text in a Paragraph so it wraps onto multiple lines instead of being cut off
            desc_text = str(k.get("description", k.get("notes", "")))
            notes_paragraph = Paragraph(desc_text, styles["JVBody"])
            rows.append([
                str(k.get("name", "")),
                str(k.get("points", k.get("score", ""))),
                str(k.get("maxPoints", k.get("max", ""))),
                notes_paragraph,
            ])
        koota_table = Table(rows, colWidths=[80, 40, 40, 260])
        koota_table.setStyle(TableStyle([
            ("FONTSIZE", (0, 0), (-1, 0), 8),
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F0E6C8")),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("GRID", (0, 0), (-1, -1), 0.4, colors.lightgrey),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))
        story.append(koota_table)

    manglik = report_json.get("manglik")
    if isinstance(manglik, dict):
        story.append(Paragraph("Manglik (Kuja) Dosha Analysis", styles["JVSection"]))
        story.append(Paragraph(str(manglik.get("conclusion", "")), styles["JVBody"]))
        if manglik.get("cancellationRules"):
            story.append(Paragraph(f"<b>Cancellations:</b> {', '.join(manglik.get('cancellationRules', []))}", styles["JVBody"]))

    remedies = report_json.get("remedies")
    if isinstance(remedies, list) and remedies:
        story.append(Paragraph("Recommended Remedies", styles["JVSection"]))
        for r in remedies:
            story.append(Paragraph(f"• {r}", styles["JVBody"]))

    strengths = report_json.get("strengths")
    if isinstance(strengths, list) and strengths:
        story.append(Paragraph("Strengths", styles["JVSection"]))
        for s in strengths:
            story.append(Paragraph(f"• {s}", styles["JVBody"]))

    challenges = report_json.get("challenges")
    if isinstance(challenges, list) and challenges:
        story.append(Paragraph("Challenges", styles["JVSection"]))
        for c in challenges:
            story.append(Paragraph(f"• {c}", styles["JVBody"]))

    story.append(Spacer(1, 16))
    story.append(Paragraph("Disclaimer", styles["JVSection"]))
    story.append(Paragraph(
        "This report reflects traditional Vedic astrological interpretation and is provided "
        "for informational and cultural purposes. It does not constitute a guaranteed "
        "prediction and is not a substitute for professional medical, legal, or financial "
        "advice. Final decisions rest with the individuals concerned.",
        styles["JVBody"],
    ))

    def _add_page_number(canvas, doc_):
        canvas.saveState()
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(colors.grey)
        canvas.drawRightString(200 * mm, 10 * mm, f"Page {doc_.page}")
        canvas.drawString(18 * mm, 10 * mm, "JyotishVeda \u2022 AI Daivajna")
        canvas.restoreState()

    doc.build(story, onFirstPage=_add_page_number, onLaterPages=_add_page_number)
    return buffer.getvalue()