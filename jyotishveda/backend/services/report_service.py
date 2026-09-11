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
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import (
    getSampleStyleSheet,
    ParagraphStyle,
)
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
)
from io import BytesIO
from reportlab.lib.enums import TA_CENTER

GOLD = colors.HexColor("#8C6D23")
DARK = colors.HexColor("#1A1A1A")


GOLD_DARK = colors.HexColor("#7E5F18")
GOLD_MAIN = colors.HexColor("#C9A050")
GOLD_LIGHT = colors.HexColor("#FFFFFF")
GOLD_BORDER = colors.HexColor("#E2D3B0")
TEXT_DARK = colors.HexColor("#1A1A1E")
TEXT_MUTED = colors.HexColor("#5A554C")


def _styles():
    styles = getSampleStyleSheet()

    # =========================================================
    # BRAND
    # =========================================================

    styles.add(ParagraphStyle(
        name="JVBrand",
        fontSize=21,
        leading=25,
        alignment=0,
        fontName="Helvetica-Bold",
        textColor=GOLD_DARK,
    ))

    styles.add(ParagraphStyle(
        name="JVTitle",
        fontSize=21,
        leading=25,
        alignment=1,
        fontName="Helvetica-Bold",
        textColor=GOLD_DARK,
        spaceAfter=4,
    ))

    styles.add(ParagraphStyle(
        name="JVSubtitle",
        fontSize=9.5,
        leading=13,
        alignment=1,
        textColor=GOLD_DARK,
        fontName="Helvetica-Bold",
        spaceAfter=10,
    ))

    # =========================================================
    # SECTIONS
    # =========================================================

    styles.add(ParagraphStyle(
        name="JVSection",
        fontSize=10,
        leading=13,
        spaceBefore=4,
        spaceAfter=3,
        textColor=GOLD_DARK,
        fontName="Helvetica-Bold",
    ))

    styles.add(ParagraphStyle(
        name="JVSubSection",
        fontSize=9,
        leading=12,
        spaceBefore=5,
        spaceAfter=3,
        textColor=TEXT_DARK,
        fontName="Helvetica-Bold",
    ))

    # =========================================================
    # BODY
    # =========================================================

    styles.add(ParagraphStyle(
        name="JVBody",
        fontSize=8.5,
        leading=12,
        textColor=TEXT_DARK,
    ))

    styles.add(ParagraphStyle(
        name="JVBodyBold",
        fontSize=9,
        leading=12.5,
        textColor=TEXT_DARK,
        fontName="Helvetica-Bold",
    ))

    styles.add(ParagraphStyle(
        name="JVBodyMuted",
        fontSize=8,
        leading=11,
        textColor=TEXT_MUTED,
    ))

    styles.add(ParagraphStyle(
        name="JVSmall",
        fontSize=7.5,
        leading=10,
        textColor=TEXT_DARK,
    ))

    # =========================================================
    # SCORE
    # =========================================================

    styles.add(ParagraphStyle(
        name="JVScore",
        fontSize=18,
        leading=22,
        alignment=1,
        textColor=GOLD_DARK,
        fontName="Helvetica-Bold",
    ))

    styles.add(ParagraphStyle(
        name="ScoreCenter",
        parent=styles["JVBody"],
        alignment=1,
        leading=14,
    ))

    # =========================================================
    # TABLE HEADERS
    # =========================================================

    styles.add(ParagraphStyle(
        name="JVTableHead",
        fontSize=8.5,
        leading=11.5,
        textColor=GOLD_DARK,
        fontName="Helvetica-Bold",
        alignment=0,
    ))

    styles.add(ParagraphStyle(
        name="JVTableHeadCenter",
        fontSize=8.5,
        leading=11.5,
        textColor=GOLD_DARK,
        fontName="Helvetica-Bold",
        alignment=1,
    ))

    styles.add(ParagraphStyle(
        name="JVTableHeadRight",
        fontSize=8.5,
        leading=11.5,
        textColor=GOLD_DARK,
        fontName="Helvetica-Bold",
        alignment=2,
    ))

    # =========================================================
    # TABLE CELLS
    # =========================================================

    styles.add(ParagraphStyle(
        name="JVTableCellCenter",
        fontSize=8.5,
        leading=11.5,
        textColor=TEXT_DARK,
        alignment=1,
    ))

    styles.add(ParagraphStyle(
        name="JVTableCellRight",
        fontSize=8.5,
        leading=11.5,
        textColor=TEXT_DARK,
        alignment=2,
        fontName="Helvetica-Bold",
    ))

    return styles

# ============================================================
# HELPERS
# ============================================================

def _value(data, *keys, default=None):
    """
    Return first available non-empty value.
    """

    if not isinstance(data, dict):
        return default

    for key in keys:
        value = data.get(key)

        if value is not None and str(value).strip() != "":
            return value

    return default


def _text(value, default="N/A"):
    if value is None:
        return default

    if isinstance(value, bool):
        return "Yes" if value else "No"

    value = str(value).strip()

    return value if value else default


def _number(value, default="0"):
    """
    7.0 -> 7
    7.50 -> 7.5
    """

    if value is None:
        return default

    try:
        number = float(value)

        if number.is_integer():
            return str(int(number))

        return f"{number:.2f}".rstrip("0").rstrip(".")

    except (ValueError, TypeError):
        return _text(value, default)


def _safe_paragraph(value, styles):
    """
    Convert arbitrary value into a ReportLab Paragraph.
    """

    return Paragraph(
        _text(value),
        styles["JVSmall"],
    )


# ============================================================
# PARSE REPORT JSON
# ============================================================

def _get_report_json(report):

    report_json = report.get("report_json") or {}

    if isinstance(report_json, str):

        try:
            report_json = json.loads(report_json)

        except json.JSONDecodeError:
            report_json = {}

    if not isinstance(report_json, dict):
        report_json = {}

    return report_json


# ============================================================
# PARTNER INFORMATION
# ============================================================

def _get_partner(report_json, report, partner_key):

    # Direct partner data
    direct_partner = report_json.get(partner_key)

    if not isinstance(direct_partner, dict):
        direct_partner = {}

    # Matching-specific partner data
    # Example:
    # report_json["partners"]["partner1"]
    partners = report_json.get("partners")

    if not isinstance(partners, dict):
        partners = {}

    nested_partner = partners.get(partner_key)

    if not isinstance(nested_partner, dict):
        nested_partner = {}

    # Merge both sources
    # nested_partner values will override direct_partner values
    partner = {
        **direct_partner,
        **nested_partner,
    }

    db_prefix = partner_key

    return {
        "fullName": _value(
            partner,
            "fullName",
            "name",
            default=report.get(
                f"{db_prefix}_name",
                "N/A",
            ),
        ),

        "dob": _value(
            partner,
            "birthDate",
            "dob",
            default=report.get(
                f"{db_prefix}_birth_date",
                "N/A",
            ),
        ),

        "birthTime": _value(
            partner,
            "birthTime",
            "time",
            default=report.get(
                f"{db_prefix}_birth_time",
                "N/A",
            ),
        ),

        "birthPlace": _value(
            partner,
            "birthPlace",
            "place",
            default=report.get(
                f"{db_prefix}_birth_place",
                "N/A",
            ),
        ),

        "rashi": _value(
            partner,
            "rashi",
            "rashiName",
            default="N/A",
        ),

        "nakshatra": _value(
            partner,
            "nakshatra",
            "nakshatraName",
            default="N/A",
        ),

        "nakshatraPada": _value(
            partner,
            "nakshatraPada",
            "pada",
            default="N/A",
        ),
    }
# ============================================================
# GET STATUS
# ============================================================

def _get_partner_status(
    report_json,
    partner_key,
):

    # --------------------------------------------------------
    # First check partner itself
    # --------------------------------------------------------

    partner = report_json.get(partner_key)

    if isinstance(partner, dict):

        status = _value(
            partner,
            "status",
            "manglikStatus",
            default=None,
        )

        if status is not None:
            return status

    # --------------------------------------------------------
    # Then check manglik.status
    # --------------------------------------------------------

    manglik = report_json.get("manglik")

    if isinstance(manglik, dict):

        status = manglik.get("status")

        if isinstance(status, dict):

            value = status.get(partner_key)

            if value is not None:
                return value

    return "N/A"


# ============================================================
# NUMEROLOGY / MULANK
# ============================================================

def _get_mulank(report_json, partner_key):

    numerology = report_json.get("numerologyMilan")

    if not isinstance(numerology, dict):
        return "N/A"

    partner = numerology.get(partner_key)

    if not isinstance(partner, dict):
        return "N/A"

    return _value(
        partner,
        "mulank",
        default="N/A",
    )


# ============================================================
# PARTNER INFORMATION TABLE
# ============================================================

def _partner_information_table(
    report_json,
    report,
    partner1,
    partner2,
    styles,
):

    p1_status = _get_partner_status(
        report_json,
        "partner1",
    )

    p2_status = _get_partner_status(
        report_json,
        "partner2",
    )

    p1_mulank = _get_mulank(
        report_json,
        "partner1",
    )

    p2_mulank = _get_mulank(
        report_json,
        "partner2",
    )

    rows = [
        [
            Paragraph(
                "<b>Information</b>",
                styles["JVSmall"],
            ),

            Paragraph(
                "<b>Partner 1</b>",
                styles["JVSmall"],
            ),

            Paragraph(
                "<b>Partner 2</b>",
                styles["JVSmall"],
            ),
        ],

        [
            "Full Name",
            _text(partner1["fullName"]),
            _text(partner2["fullName"]),
        ],

        [
            "Date of Birth",
            _text(partner1["dob"]),
            _text(partner2["dob"]),
        ],

        [
            "Birth Time",
            _text(partner1["birthTime"]),
            _text(partner2["birthTime"]),
        ],

        [
            "Birth Place",
            _text(partner1["birthPlace"]),
            _text(partner2["birthPlace"]),
        ],

        [
            "Rashi",
            _text(partner1["rashi"]),
            _text(partner2["rashi"]),
        ],

        [
            "Nakshatra",
            _text(partner1["nakshatra"]),
            _text(partner2["nakshatra"]),
        ],

        [
            "Nakshatra Pada",
            _text(partner1["nakshatraPada"]),
            _text(partner2["nakshatraPada"]),
        ],

        [
            "Status",
            _text(p1_status),
            _text(p2_status),
        ],

        [
            "Mulank",
            _number(p1_mulank),
            _number(p2_mulank),
        ],
    ]

    table = Table(
        rows,
        colWidths=[
            55 * mm,
            62 * mm,
            62 * mm,
        ],
        repeatRows=1,
    )

    table.setStyle(TableStyle([

        (
            "BACKGROUND",
            (0, 0),
            (-1, 0),
            colors.HexColor("#F0E6C8"),
        ),

        (
            "FONTNAME",
            (0, 0),
            (-1, 0),
            "Helvetica-Bold",
        ),

        (
            "FONTNAME",
            (0, 1),
            (0, -1),
            "Helvetica-Bold",
        ),

        (
            "FONTSIZE",
            (0, 0),
            (-1, -1),
            8.5,
        ),

        (
            "GRID",
            (0, 0),
            (-1, -1),
            0.4,
            colors.lightgrey,
        ),

        (
            "VALIGN",
            (0, 0),
            (-1, -1),
            "TOP",
        ),

        (
            "LEFTPADDING",
            (0, 0),
            (-1, -1),
            6,
        ),

        (
            "RIGHTPADDING",
            (0, 0),
            (-1, -1),
            6,
        ),

        (
            "TOPPADDING",
            (0, 0),
            (-1, -1),
            6,
        ),

        (
            "BOTTOMPADDING",
            (0, 0),
            (-1, -1),
            6,
        ),
    ]))

    return table


# ============================================================
# ASHTA KOOTA
# ============================================================

def _get_kootas(report_json):

    # --------------------------------------------------------
    # Preferred:
    #
    # kootas: [...]
    # --------------------------------------------------------

    kootas = report_json.get("kootas")

    if isinstance(kootas, list) and kootas:
        return kootas

    # --------------------------------------------------------
    # Your JSON:
    #
    # ashtaKoota: {
    #     gana: {...},
    #     nadi: {...},
    #     ...
    # }
    # --------------------------------------------------------

    ashta = report_json.get("ashtaKoota")

    if isinstance(ashta, dict):

        result = []

        # Desired display order
        order = [
            "varna",
            "vashya",
            "tara",
            "yoni",
            "grahaMaitri",
            "gana",
            "bhakoot",
            "nadi",
        ]

        for key in order:

            value = ashta.get(key)

            if isinstance(value, dict):

                item = dict(value)

                item["_key"] = key

                if not item.get("name"):
                    item["name"] = key

                result.append(item)

        return result

    return []


# ============================================================
# KOOTA DISPLAY NAME
# ============================================================

def _koota_name(koota):

    name = _value(
        koota,
        "name",
        "area",
        "sanskritName",
        default=None,
    )

    if name:
        return str(name)

    key = koota.get("_key")

    names = {
        "varna": "Varna",
        "vashya": "Vashya",
        "tara": "Tara",
        "yoni": "Yoni",
        "grahaMaitri": "Graha Maitri",
        "gana": "Gana",
        "bhakoot": "Bhakoot",
        "nadi": "Nadi",
    }

    return names.get(
        key,
        "Koota",
    )


# ============================================================
# KOOTA PARTNER VALUES
# ============================================================

def _koota_partner_values(koota):

    key = koota.get("_key")

    p1 = "N/A"
    p2 = "N/A"

    # --------------------------------------------------------
    # Generic structure
    # --------------------------------------------------------

    generic_p1 = _value(
        koota,
        "p1Value",
        "partner1Value",
        default=None,
    )

    generic_p2 = _value(
        koota,
        "p2Value",
        "partner2Value",
        default=None,
    )

    if generic_p1 is not None:
        p1 = generic_p1

    if generic_p2 is not None:
        p2 = generic_p2

    # --------------------------------------------------------
    # Specific ashtaKoota structures from your JSON
    # --------------------------------------------------------

    if key == "yoni":

        p1 = _value(
            koota,
            "yoni1",
            default=p1,
        )

        p2 = _value(
            koota,
            "yoni2",
            default=p2,
        )

    elif key == "vashya":

        p1 = _value(
            koota,
            "class1",
            default=p1,
        )

        p2 = _value(
            koota,
            "class2",
            default=p2,
        )

    elif key == "grahaMaitri":

        p1 = _value(
            koota,
            "lord1",
            default=p1,
        )

        p2 = _value(
            koota,
            "lord2",
            default=p2,
        )

    elif key == "tara":

        tara1 = _value(
            koota,
            "tara1",
            default=None,
        )

        tara2 = _value(
            koota,
            "tara2",
            default=None,
        )

        if tara1 is not None:
            p1 = tara1

        if tara2 is not None:
            p2 = tara2

    elif key == "bhakoot":

        relation = _value(
            koota,
            "relation",
            default=None,
        )

        if relation:
            p1 = relation
            p2 = relation

    elif key == "nadi":

        same_nadi = _value(
            koota,
            "sameNadi",
            default=None,
        )

        if same_nadi is not None:
            p1 = "Same Nadi" if same_nadi else "Different Nadi"
            p2 = "Same Nadi" if same_nadi else "Different Nadi"

    return p1, p2


# ============================================================
# KOOTA DESCRIPTION
# ============================================================

def _koota_description(koota):

    key = koota.get("_key")

    description = _value(
        koota,
        "description",
        "verdict",
        "note",
        "notes",
        "result",
        default=None,
    )

    if description:
        return description

    # --------------------------------------------------------
    # Automatically describe available raw information
    # --------------------------------------------------------

    if key == "tara":

        tara1 = _value(
            koota,
            "tara1",
            default="N/A",
        )

        tara2 = _value(
            koota,
            "tara2",
            default="N/A",
        )

        return (
            f"Tara values: Partner 1 = {tara1}, "
            f"Partner 2 = {tara2}."
        )

    if key == "bhakoot":

        relation = _value(
            koota,
            "relation",
            default="N/A",
        )

        dosha = _value(
            koota,
            "dosha",
            default=None,
        )

        cancellation = _value(
            koota,
            "cancellationApplied",
            default=None,
        )

        result = f"Relation: {relation}."

        if dosha is not None:
            result += f" Dosha: {'Yes' if dosha else 'No'}."

        if cancellation is not None:
            result += (
                f" Cancellation applied: "
                f"{'Yes' if cancellation else 'No'}."
            )

        return result

    if key == "nadi":

        same_nadi = _value(
            koota,
            "sameNadi",
            default=None,
        )

        cancellation = _value(
            koota,
            "cancellationApplied",
            default=None,
        )

        result = ""

        if same_nadi is not None:
            result += (
                f"Same Nadi: "
                f"{'Yes' if same_nadi else 'No'}."
            )

        if cancellation is not None:
            result += (
                f" Cancellation applied: "
                f"{'Yes' if cancellation else 'No'}."
            )

        return result or "N/A"

    return "N/A"


# ============================================================
# ASHTA KOOTA TABLE
# ============================================================

def _build_koota_table(report_json, styles):

    kootas = _get_kootas(report_json)

    if not kootas:
        return None

    rows = [
        [
            Paragraph("<b>Koota</b>", styles["JVSmall"]),
            Paragraph("<b>Partner 1</b>", styles["JVSmall"]),
            Paragraph("<b>Partner 2</b>", styles["JVSmall"]),
            Paragraph("<b>Score</b>", styles["JVSmall"]),
            Paragraph("<b>Max</b>", styles["JVSmall"]),
            Paragraph(
                "<b>Description / Result</b>",
                styles["JVSmall"],
            ),
        ]
    ]

    for koota in kootas:

        if not isinstance(koota, dict):
            continue

        name = _koota_name(koota)

        p1, p2 = _koota_partner_values(
            koota
        )

        score = _value(
            koota,
            "score",
            "points",
            "obtainedPoints",
            default=0,
        )

        max_score = _value(
            koota,
            "maxScore",
            "maxPoints",
            "max",
            default=0,
        )

        description = _koota_description(
            koota
        )

        rows.append([
            Paragraph(
                _text(name),
                styles["JVSmall"],
            ),

            Paragraph(
                _text(p1),
                styles["JVSmall"],
            ),

            Paragraph(
                _text(p2),
                styles["JVSmall"],
            ),

            Paragraph(
                _number(score),
                styles["JVSmall"],
            ),

            Paragraph(
                _number(max_score),
                styles["JVSmall"],
            ),

            Paragraph(
                _text(description),
                styles["JVSmall"],
            ),
        ])

    table = Table(
        rows,
        colWidths=[
            27 * mm,
            29 * mm,
            29 * mm,
            17 * mm,
            17 * mm,
            61 * mm,
        ],
        repeatRows=1,
    )

    table.setStyle(TableStyle([

        (
            "BACKGROUND",
            (0, 0),
            (-1, 0),
            colors.HexColor("#F0E6C8"),
        ),

        (
            "FONTNAME",
            (0, 0),
            (-1, 0),
            "Helvetica-Bold",
        ),

        (
            "GRID",
            (0, 0),
            (-1, -1),
            0.4,
            colors.lightgrey,
        ),

        (
            "VALIGN",
            (0, 0),
            (-1, -1),
            "TOP",
        ),

        (
            "ALIGN",
            (3, 1),
            (4, -1),
            "CENTER",
        ),

        (
            "LEFTPADDING",
            (0, 0),
            (-1, -1),
            4,
        ),

        (
            "RIGHTPADDING",
            (0, 0),
            (-1, -1),
            4,
        ),

        (
            "TOPPADDING",
            (0, 0),
            (-1, -1),
            5,
        ),

        (
            "BOTTOMPADDING",
            (0, 0),
            (-1, -1),
            5,
        ),
    ]))

    return table


# ============================================================
# OVERALL SCORE
# ============================================================

def _get_overall_score(
    report_json,
    report,
):

    summary = report_json.get("summary")

    if not isinstance(summary, dict):
        summary = {}

    total = _value(
        report_json,
        "totalPoints",
        "totalScore",
        default=None,
    )

    if total is None:

        total = _value(
            summary,
            "totalScore",
            "totalPoints",
            default=None,
        )

    if total is None:
        total = report.get(
            "total_score",
            0,
        )

    max_points = _value(
        report_json,
        "maxPoints",
        "maxScore",
        default=None,
    )

    if max_points is None:

        max_points = _value(
            summary,
            "maxScore",
            "maxPoints",
            default=None,
        )

    if max_points is None:
        max_points = report.get(
            "max_score",
            36,
        )

    percentage = _value(
        report_json,
        "percentage",
        default=None,
    )

    if percentage is None:

        percentage = _value(
            summary,
            "percentage",
            default=None,
        )

    if percentage is None:

        try:

            if float(max_points) > 0:

                percentage = (
                    float(total)
                    / float(max_points)
                    * 100
                )

            else:
                percentage = 0

        except (
            ValueError,
            TypeError,
            ZeroDivisionError,
        ):
            percentage = 0

    return (
        total,
        max_points,
        percentage,
    )


# ============================================================
# CHART HELPERS
# ============================================================

def _get_chart(report_json, partner_key):

    charts = report_json.get("charts")

    if not isinstance(charts, dict):
        return {}

    chart = charts.get(partner_key)

    if not isinstance(chart, dict):
        return {}

    return chart


# ============================================================
# CHART PARTNER BASIC INFORMATION
# ============================================================

def _build_chart_basic_info(
    chart,
    styles,
):

    partner = chart.get("partner")

    if not isinstance(partner, dict):
        partner = {}

    rows = [
        [
            Paragraph(
                "<b>Chart Information</b>",
                styles["JVSmall"],
            ),
            Paragraph(
                "<b>Value</b>",
                styles["JVSmall"],
            ),
        ],

        [
            "Name",
            _safe_paragraph(
                _value(
                    partner,
                    "fullName",
                    "name",
                ),
                styles,
            ),
        ],

        [
            "Date of Birth",
            _safe_paragraph(
                _value(
                    partner,
                    "birthDate",
                    "dob",
                ),
                styles,
            ),
        ],

        [
            "Birth Time",
            _safe_paragraph(
                _value(
                    partner,
                    "birthTime",
                    "time",
                ),
                styles,
            ),
        ],

        [
            "Birth Place",
            _safe_paragraph(
                _value(
                    partner,
                    "birthPlace",
                    "place",
                ),
                styles,
            ),
        ],

        [
            "Timezone",
            _safe_paragraph(
                partner.get("timezone"),
                styles,
            ),
        ],

        [
            "Latitude",
            _safe_paragraph(
                partner.get("latitude"),
                styles,
            ),
        ],

        [
            "Longitude",
            _safe_paragraph(
                partner.get("longitude"),
                styles,
            ),
        ],

        [
            "House System",
            _safe_paragraph(
                partner.get("houseSystem"),
                styles,
            ),
        ],

        [
            "Horoscope System",
            _safe_paragraph(
                partner.get("horoscopeSystem"),
                styles,
            ),
        ],

        [
            "Node Type",
            _safe_paragraph(
                partner.get("nodeType"),
                styles,
            ),
        ],
    ]

    table = Table(
        rows,
        colWidths=[
            55 * mm,
            125 * mm,
        ],
    )

    table.setStyle(TableStyle([

        (
            "BACKGROUND",
            (0, 0),
            (-1, 0),
            colors.HexColor("#F0E6C8"),
        ),

        (
            "FONTNAME",
            (0, 0),
            (-1, 0),
            "Helvetica-Bold",
        ),

        (
            "FONTNAME",
            (0, 1),
            (0, -1),
            "Helvetica-Bold",
        ),

        (
            "GRID",
            (0, 0),
            (-1, -1),
            0.4,
            colors.lightgrey,
        ),

        (
            "VALIGN",
            (0, 0),
            (-1, -1),
            "TOP",
        ),

        (
            "FONTSIZE",
            (0, 0),
            (-1, -1),
            8,
        ),

        (
            "LEFTPADDING",
            (0, 0),
            (-1, -1),
            5,
        ),

        (
            "RIGHTPADDING",
            (0, 0),
            (-1, -1),
            5,
        ),

        (
            "TOPPADDING",
            (0, 0),
            (-1, -1),
            5,
        ),

        (
            "BOTTOMPADDING",
            (0, 0),
            (-1, -1),
            5,
        ),
    ]))

    return table


# ============================================================
# ASCENDANT TABLE
# ============================================================

def _build_ascendant_table(
    chart,
    styles,
):

    ascendant = chart.get("ascendant")

    if not isinstance(ascendant, dict):
        return None

    rows = [
        [
            Paragraph(
                "<b>Ascendant</b>",
                styles["JVSmall"],
            ),
            Paragraph(
                "<b>Value</b>",
                styles["JVSmall"],
            ),
        ],

        [
            "Sign",
            _safe_paragraph(
                ascendant.get("signName"),
                styles,
            ),
        ],

        [
            "Sign Sanskrit",
            _safe_paragraph(
                ascendant.get("signSanskrit"),
                styles,
            ),
        ],

        [
            "Degree",
            _safe_paragraph(
                ascendant.get("degree"),
                styles,
            ),
        ],

        [
            "Degree DMS",
            _safe_paragraph(
                ascendant.get("degreeDMS"),
                styles,
            ),
        ],

        [
            "Nakshatra",
            _safe_paragraph(
                ascendant.get("nakshatra"),
                styles,
            ),
        ],

        [
            "Nakshatra Lord",
            _safe_paragraph(
                ascendant.get("nakshatraLord"),
                styles,
            ),
        ],

        [
            "Pada",
            _safe_paragraph(
                ascendant.get("pada"),
                styles,
            ),
        ],
    ]

    table = Table(
        rows,
        colWidths=[
            55 * mm,
            125 * mm,
        ],
    )

    table.setStyle(TableStyle([

        (
            "BACKGROUND",
            (0, 0),
            (-1, 0),
            colors.HexColor("#F0E6C8"),
        ),

        (
            "FONTNAME",
            (0, 0),
            (-1, 0),
            "Helvetica-Bold",
        ),

        (
            "FONTNAME",
            (0, 1),
            (0, -1),
            "Helvetica-Bold",
        ),

        (
            "GRID",
            (0, 0),
            (-1, -1),
            0.4,
            colors.lightgrey,
        ),

        (
            "FONTSIZE",
            (0, 0),
            (-1, -1),
            8,
        ),

        (
            "VALIGN",
            (0, 0),
            (-1, -1),
            "TOP",
        ),

        (
            "LEFTPADDING",
            (0, 0),
            (-1, -1),
            5,
        ),

        (
            "RIGHTPADDING",
            (0, 0),
            (-1, -1),
            5,
        ),

        (
            "TOPPADDING",
            (0, 0),
            (-1, -1),
            5,
        ),

        (
            "BOTTOMPADDING",
            (0, 0),
            (-1, -1),
            5,
        ),
    ]))

    return table


# ============================================================
# PLANET TABLE
# ============================================================

def _build_planet_table(
    chart,
    styles,
):

    planets = chart.get("planets")

    if not isinstance(planets, list):
        return None

    if not planets:
        return None

    rows = [
        [
            Paragraph("<b>Planet</b>", styles["JVSmall"]),
            Paragraph("<b>Sign</b>", styles["JVSmall"]),
            Paragraph("<b>Degree</b>", styles["JVSmall"]),
            Paragraph("<b>House</b>", styles["JVSmall"]),
            Paragraph("<b>Nakshatra</b>", styles["JVSmall"]),
            Paragraph("<b>Pada</b>", styles["JVSmall"]),
            Paragraph("<b>Retro</b>", styles["JVSmall"]),
        ]
    ]

    for planet in planets:

        if not isinstance(planet, dict):
            continue

        rows.append([
            _safe_paragraph(
                _value(
                    planet,
                    "name",
                    "sanskritName",
                ),
                styles,
            ),

            _safe_paragraph(
                _value(
                    planet,
                    "signName",
                    "sign",
                ),
                styles,
            ),

            _safe_paragraph(
                _value(
                    planet,
                    "degreeDMS",
                    "degree",
                ),
                styles,
            ),

            _safe_paragraph(
                planet.get("house"),
                styles,
            ),

            _safe_paragraph(
                planet.get("nakshatra"),
                styles,
            ),

            _safe_paragraph(
                planet.get("pada"),
                styles,
            ),

            _safe_paragraph(
                planet.get("retrograde"),
                styles,
            ),
        ])

    table = Table(
        rows,
        colWidths=[
            27 * mm,
            27 * mm,
            28 * mm,
            18 * mm,
            39 * mm,
            15 * mm,
            18 * mm,
        ],
        repeatRows=1,
    )

    table.setStyle(TableStyle([

        (
            "BACKGROUND",
            (0, 0),
            (-1, 0),
            colors.HexColor("#F0E6C8"),
        ),

        (
            "FONTNAME",
            (0, 0),
            (-1, 0),
            "Helvetica-Bold",
        ),

        (
            "GRID",
            (0, 0),
            (-1, -1),
            0.4,
            colors.lightgrey,
        ),

        (
            "VALIGN",
            (0, 0),
            (-1, -1),
            "TOP",
        ),

        (
            "FONTSIZE",
            (0, 0),
            (-1, -1),
            7,
        ),

        (
            "ALIGN",
            (3, 1),
            (3, -1),
            "CENTER",
        ),

        (
            "ALIGN",
            (5, 1),
            (6, -1),
            "CENTER",
        ),

        (
            "LEFTPADDING",
            (0, 0),
            (-1, -1),
            3,
        ),

        (
            "RIGHTPADDING",
            (0, 0),
            (-1, -1),
            3,
        ),

        (
            "TOPPADDING",
            (0, 0),
            (-1, -1),
            4,
        ),

        (
            "BOTTOMPADDING",
            (0, 0),
            (-1, -1),
            4,
        ),
    ]))

    return table


# ============================================================
# HOUSE CUSPS
# ============================================================

def _build_house_cusp_table(
    chart,
    styles,
):

    cusps = chart.get("houseCusps")

    if not isinstance(cusps, list):
        return None

    if not cusps:
        return None

    rows = [
        [
            Paragraph("<b>House</b>", styles["JVSmall"]),
            Paragraph("<b>Sign</b>", styles["JVSmall"]),
            Paragraph("<b>Degree</b>", styles["JVSmall"]),
            Paragraph(
                "<b>Sidereal Longitude</b>",
                styles["JVSmall"],
            ),
        ]
    ]

    for cusp in cusps:

        if not isinstance(cusp, dict):
            continue

        rows.append([
            _safe_paragraph(
                cusp.get("house"),
                styles,
            ),

            _safe_paragraph(
                cusp.get("signName"),
                styles,
            ),

            _safe_paragraph(
                cusp.get("degree"),
                styles,
            ),

            _safe_paragraph(
                cusp.get("longitudeSidereal"),
                styles,
            ),
        ])

    table = Table(
        rows,
        colWidths=[
            30 * mm,
            55 * mm,
            45 * mm,
            50 * mm,
        ],
        repeatRows=1,
    )

    table.setStyle(TableStyle([

        (
            "BACKGROUND",
            (0, 0),
            (-1, 0),
            colors.HexColor("#F0E6C8"),
        ),

        (
            "FONTNAME",
            (0, 0),
            (-1, 0),
            "Helvetica-Bold",
        ),

        (
            "GRID",
            (0, 0),
            (-1, -1),
            0.4,
            colors.lightgrey,
        ),

        (
            "VALIGN",
            (0, 0),
            (-1, -1),
            "TOP",
        ),

        (
            "FONTSIZE",
            (0, 0),
            (-1, -1),
            7.5,
        ),

        (
            "ALIGN",
            (0, 1),
            (0, -1),
            "CENTER",
        ),

        (
            "LEFTPADDING",
            (0, 0),
            (-1, -1),
            4,
        ),

        (
            "RIGHTPADDING",
            (0, 0),
            (-1, -1),
            4,
        ),

        (
            "TOPPADDING",
            (0, 0),
            (-1, -1),
            4,
        ),

        (
            "BOTTOMPADDING",
            (0, 0),
            (-1, -1),
            4,
        ),
    ]))

    return table


# ============================================================
# CALCULATION INFORMATION
# ============================================================

def _build_calculation_table(
    chart,
    styles,
):

    calculation = chart.get("calculation")

    if not isinstance(calculation, dict):
        return None

    rows = [
        [
            Paragraph(
                "<b>Calculation Parameter</b>",
                styles["JVSmall"],
            ),
            Paragraph(
                "<b>Value</b>",
                styles["JVSmall"],
            ),
        ]
    ]

    preferred_keys = [
        "engine",
        "zodiac",
        "ayanamsha",
        "latitude",
        "longitude",
        "timezone",
        "houseSystem",
        "nodeType",
        "julianDayUT",
        "ephemerisFlags",
        "coordinateFrame",
    ]

    for key in preferred_keys:

        if key not in calculation:
            continue

        value = calculation.get(key)

        # Don't show huge nested structures here
        if isinstance(value, (dict, list)):
            value = json.dumps(
                value,
                ensure_ascii=False,
            )

        rows.append([
            Paragraph(
                str(key),
                styles["JVSmall"],
            ),

            Paragraph(
                _text(value),
                styles["JVSmall"],
            ),
        ])

    if len(rows) == 1:
        return None

    table = Table(
        rows,
        colWidths=[
            65 * mm,
            115 * mm,
        ],
        repeatRows=1,
    )

    table.setStyle(TableStyle([

        (
            "BACKGROUND",
            (0, 0),
            (-1, 0),
            colors.HexColor("#F0E6C8"),
        ),

        (
            "FONTNAME",
            (0, 0),
            (-1, 0),
            "Helvetica-Bold",
        ),

        (
            "FONTNAME",
            (0, 1),
            (0, -1),
            "Helvetica-Bold",
        ),

        (
            "GRID",
            (0, 0),
            (-1, -1),
            0.4,
            colors.lightgrey,
        ),

        (
            "FONTSIZE",
            (0, 0),
            (-1, -1),
            7.5,
        ),

        (
            "VALIGN",
            (0, 0),
            (-1, -1),
            "TOP",
        ),

        (
            "LEFTPADDING",
            (0, 0),
            (-1, -1),
            5,
        ),

        (
            "RIGHTPADDING",
            (0, 0),
            (-1, -1),
            5,
        ),

        (
            "TOPPADDING",
            (0, 0),
            (-1, -1),
            4,
        ),

        (
            "BOTTOMPADDING",
            (0, 0),
            (-1, -1),
            4,
        ),
    ]))

    return table


# ============================================================
# FULL CHART SECTION
# ============================================================

def _build_chart_section(
    report_json,
    partner_key,
    partner_label,
    styles,
):

    chart = _get_chart(
        report_json,
        partner_key,
    )

    if not chart:
        return []

    story = []

    story.append(
        Paragraph(
            partner_label,
            styles["JVSection"],
        )
    )

    # --------------------------------------------------------
    # Basic birth information
    # --------------------------------------------------------

    basic_table = _build_chart_basic_info(
        chart,
        styles,
    )

    if basic_table:
        story.append(basic_table)
        story.append(Spacer(1, 7))

    # --------------------------------------------------------
    # Ascendant
    # --------------------------------------------------------

    ascendant_table = _build_ascendant_table(
        chart,
        styles,
    )

    if ascendant_table:

        story.append(
            Paragraph(
                "Ascendant",
                styles["JVSubSection"],
            )
        )

        story.append(
            ascendant_table
        )

        story.append(
            Spacer(1, 7)
        )

    # --------------------------------------------------------
    # Planets
    # --------------------------------------------------------

    planet_table = _build_planet_table(
        chart,
        styles,
    )

    if planet_table:

        story.append(
            Paragraph(
                "Planetary Positions",
                styles["JVSubSection"],
            )
        )

        story.append(
            planet_table
        )

        story.append(
            Spacer(1, 7)
        )

    # --------------------------------------------------------
    # House Cusps
    # --------------------------------------------------------

    house_table = _build_house_cusp_table(
        chart,
        styles,
    )

    if house_table:

        story.append(
            Paragraph(
                "House Cusps",
                styles["JVSubSection"],
            )
        )

        story.append(
            house_table
        )

        story.append(
            Spacer(1, 7)
        )

    # --------------------------------------------------------
    # Calculation
    # --------------------------------------------------------

    calculation_table = _build_calculation_table(
        chart,
        styles,
    )

    if calculation_table:

        story.append(
            Paragraph(
                "Calculation Details",
                styles["JVSubSection"],
            )
        )

        story.append(
            calculation_table
        )

    return story


# ============================================================
# MAIN PDF FUNCTION
# ============================================================

def generate_match_report_pdf(
    report: dict
) -> bytes:

    styles = _styles()

    buffer = io.BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,

        topMargin=20 * mm,
        bottomMargin=18 * mm,

        leftMargin=18 * mm,
        rightMargin=18 * mm,

        title="JyotishVeda Kundli Milan Report",
        author="JyotishVeda",
    )

    story = []

    # ========================================================
    # JSON
    # ========================================================

    report_json = _get_report_json(
        report
    )

    # ========================================================
    # PARTNERS
    # ========================================================

    partner1 = _get_partner(
        report_json,
        report,
        "partner1",
    )

    partner2 = _get_partner(
        report_json,
        report,
        "partner2",
    )

    # ========================================================
    # HEADER
    # ========================================================

    story.append(
        Paragraph(
            "JYOTISHVEDA",
            styles["JVTitle"],
        )
    )

    story.append(
        Paragraph(
            "Official Vedic Kundli Milan &amp; "
            "Ashta Koota Compatibility Report",
            styles["JVSubtitle"],
        )
    )

    # ========================================================
    # PARTNER INFORMATION
    # ========================================================

    story.append(
        Paragraph(
            "Partner Information",
            styles["JVSection"],
        )
    )

    story.append(
        _partner_information_table(
            report_json,
            report,
            partner1,
            partner2,
            styles,
        )
    )

    story.append(
        Spacer(1, 10)
    )

    # ========================================================
    # OVERALL SCORE
    # ========================================================

    total, max_points, percentage = (
        _get_overall_score(
            report_json,
            report,
        )
    )

    story.append(
        Paragraph(
            "Overall Compatibility",
            styles["JVSection"],
        )
    )

    score_table = Table(
        [
            [
                Paragraph(
                    _number(total),
                    styles["JVScore"],
                ),

                Paragraph(
                    _number(max_points),
                    styles["JVScore"],
                ),

                Paragraph(
                    f"{float(percentage):.2f}%",
                    styles["JVScore"],
                ),
            ],

            [
                "Total Points",
                "Maximum Points",
                "Percentage",
            ],
        ],

        colWidths=[
            60 * mm,
            60 * mm,
            60 * mm,
        ],
    )

    score_table.setStyle(TableStyle([

        (
            "BACKGROUND",
            (0, 0),
            (-1, 0),
            colors.HexColor("#FFF9E8"),
        ),

        (
            "GRID",
            (0, 0),
            (-1, -1),
            0.5,
            colors.lightgrey,
        ),

        (
            "ALIGN",
            (0, 0),
            (-1, -1),
            "CENTER",
        ),

        (
            "VALIGN",
            (0, 0),
            (-1, -1),
            "MIDDLE",
        ),

        (
            "FONTNAME",
            (0, 1),
            (-1, 1),
            "Helvetica-Bold",
        ),

        (
            "FONTSIZE",
            (0, 1),
            (-1, 1),
            8,
        ),

        (
            "TOPPADDING",
            (0, 0),
            (-1, 0),
            10,
        ),

        (
            "BOTTOMPADDING",
            (0, 0),
            (-1, 0),
            10,
        ),

        (
            "TOPPADDING",
            (0, 1),
            (-1, 1),
            6,
        ),

        (
            "BOTTOMPADDING",
            (0, 1),
            (-1, 1),
            6,
        ),
    ]))

    story.append(
        score_table
    )

    # ========================================================
    # VERDICT
    # ========================================================

    summary = report_json.get(
        "summary"
    )

    if not isinstance(summary, dict):
        summary = {}

    verdict_title = _value(
        report_json,
        "verdictTitle",
        default=None,
    )


    if verdict_title is None:

        verdict_title = _value(
            summary,
            "verdictTitle",
            default=None,
        )

    description = _value(
        report_json,
        "description",
        "verdictDescription",
        default=None,
    )

    if description is None:

        description = _value(
            summary,
            "description",
            "verdictDescription",
            default=None,
        )

    if verdict_title or description:

        story.append(
            Paragraph(
                "Overall Result",
                styles["JVSection"],
            )
        )

        if verdict_title:

            story.append(
                Paragraph(
                    f"<b>Verdict: {_text(verdict_title)}</b>",
                    styles["JVBody"],
                )
            )

        if description:

            story.append(
                Paragraph(
                    _text(description),
                    styles["JVBody"],
                )
            )

    # ========================================================
    # ASHTA KOOTA
    # ========================================================

    story.append(
        Paragraph(
            "Ashta Koota Analysis",
            styles["JVSection"],
        )
    )

    koota_table = _build_koota_table(
        report_json,
        styles,
    )

    if koota_table:

        story.append(
            koota_table
        )

    else:

        story.append(
            Paragraph(
                "Ashta Koota result is not available.",
                styles["JVBody"],
            )
        )

    # ========================================================
    # CHARTS
    # ========================================================

    charts_exist = isinstance(
        report_json.get("charts"),
        dict,
    )

    if charts_exist:

        story.append(
            PageBreak()
        )

        story.append(
            Paragraph(
                "Kundli Charts",
                styles["JVSection"],
            )
        )

        # ----------------------------------------------------
        # Partner 1 Chart
        # ----------------------------------------------------

        story.extend(
            _build_chart_section(
                report_json,
                "partner1",
                "Partner 1 - Kundli Chart",
                styles,
            )
        )

        # ----------------------------------------------------
        # Partner 2 Chart
        # ----------------------------------------------------

        story.append(
            Spacer(1, 12)
        )

        story.extend(
            _build_chart_section(
                report_json,
                "partner2",
                "Partner 2 - Kundli Chart",
                styles,
            )
        )



    # ========================================================
    # DISCLAIMER
    # ========================================================

    story.append(
        Spacer(1, 16)
    )

    story.append(
        Paragraph(
            "Disclaimer",
            styles["JVSection"],
        )
    )

    story.append(
        Paragraph(
            "This report reflects traditional Vedic astrological "
            "interpretation and is provided for informational and "
            "cultural purposes. It does not constitute a guaranteed "
            "prediction and is not a substitute for professional "
            "medical, legal, or financial advice. Final decisions "
            "rest with the individuals concerned.",
            styles["JVBody"],
        )
    )

    # ========================================================
    # PAGE NUMBER
    # ========================================================

    def _add_page_number(
        canvas,
        doc_,
    ):

        canvas.saveState()

        canvas.setFont(
            "Helvetica",
            8,
        )

        canvas.setFillColor(
            colors.grey
        )

        canvas.drawRightString(
            200 * mm,
            10 * mm,
            f"Page {doc_.page}",
        )

        canvas.drawString(
            18 * mm,
            10 * mm,
            "JyotishVeda • AI Daivajna",
        )

        canvas.restoreState()

    # ========================================================
    # BUILD PDF
    # ========================================================

    doc.build(
        story,
        onFirstPage=_add_page_number,
        onLaterPages=_add_page_number,
    )

    return buffer.getvalue()
def _pdf_text(value, default=""):
    """
    Safely convert a value into text for PDF rendering.
    Handles None, dict, list and normal values.
    """

    if value is None:
        return default

    if isinstance(value, (dict, list)):
        return json.dumps(
            value,
            ensure_ascii=False,
            indent=2
        )

    return str(value)

def generate_ai_synthesis_pdf(row: dict) -> bytes:

    buffer = BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        topMargin=20 * mm,
        bottomMargin=18 * mm,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        title="JyotishVeda AI Compatibility Synthesis",
    )

    styles = _styles()

    title_style = styles["JVTitle"]
    subtitle_style = styles["JVSubtitle"]
    heading_style = styles["JVSection"]
    body_style = styles["JVBody"]

    bullet_style = ParagraphStyle(
        "AIBullet",
        parent=styles["JVBody"],
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=6,
    )

    story = []

    # =========================================================
    # BASIC DATA
    # =========================================================

    partner1_name = (
        row.get("partner1_name")
        or "Partner 1"
    )

    partner2_name = (
        row.get("partner2_name")
        or "Partner 2"
    )

    total_score = (
        row.get("total_score")
        if row.get("total_score") is not None
        else "N/A"
    )

    max_score = (
        row.get("max_score")
        if row.get("max_score") is not None
        else 36
    )

    # =========================================================
    # SYNTHESIS JSON
    # =========================================================

    synthesis_json = row.get("synthesis_json")

    if isinstance(synthesis_json, str):

        synthesis = json.loads(
            synthesis_json
        )

    elif isinstance(synthesis_json, dict):

        synthesis = synthesis_json

    else:

        synthesis = {}

    # =========================================================
    # TITLE
    # =========================================================

    story.append(
        Paragraph(
            "JYOTISHVEDA",
            title_style
        )
    )

    story.append(
        Paragraph(
            "Daivajna Deep Relationship Synthesis<br/>"
            f"for <b>{_pdf_text(partner1_name)}</b> &amp; <b>{_pdf_text(partner2_name)}</b>",
            subtitle_style
        )
    )

    # =========================================================
    # ASHTA KOOTA SCORE
    # =========================================================

    story.append(
        Paragraph(
            "Ashta Koota Score",
            heading_style
        )
    )

    score_table = Table(
        [
            [
                "Total Score",
                "Maximum Score"
            ],
            [
                str(total_score),
                str(max_score)
            ]
        ],
        colWidths=[
            75 * mm,
            75 * mm
        ]
    )

    score_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#FFF9E8")),
            ("TEXTCOLOR", (0, 0), (-1, 0), GOLD_DARK),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.lightgrey),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.lightgrey),
        ])
    )

    story.append(score_table)

    story.append(Spacer(1, 8))

    # =========================================================
    # MANGLIK DOSHA
    # =========================================================

    story.append(
        Paragraph(
            "Manglik Dosha",
            heading_style
        )
    )

    manglik = synthesis.get(
        "manglik_dosha",
        {}
    )

    if not isinstance(manglik, dict):
        manglik = {}

    p1_manglik = (
        manglik.get("partner1")
        or row.get("partner1_manglik_status")
        or "Manglik status unavailable"
    )

    p2_manglik = (
        manglik.get("partner2")
        or row.get("partner2_manglik_status")
        or "Manglik status unavailable"
    )

    manglik_present = manglik.get(
        "present",
        False
    )

    manglik_table = Table(
        [
            [
                "Partner",
                "Manglik Status"
            ],
            [
                str(partner1_name),
                str(p1_manglik)
            ],
            [
                str(partner2_name),
                str(p2_manglik)
            ],
            [
                "Dosha Present",
                "Yes" if manglik_present else "No"
            ]
        ],
        colWidths=[
            60 * mm,
            90 * mm
        ]
    )

    manglik_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#FFF9E8")),
            ("TEXTCOLOR", (0, 0), (-1, 0), GOLD_DARK),
            ("ALIGN", (0, 0), (-1, -1), "LEFT"),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.lightgrey),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.lightgrey),
        ])
    )

    story.append(manglik_table)

    # =========================================================
    # AI SYNTHESIS SECTIONS
    # =========================================================

    sections = [

        (
            "Overall Compatibility",
            "overall_compatibility"
        ),

        (
            "Guna Milan",
            "guna_milan"
        ),

        (
            "Psychological Affinity",
            "psychological_affinity"
        ),

        (
            "Emotional Resonance",
            "emotional_resonance"
        ),

        (
            "Karmic Bond",
            "karmic_bond"
        ),

        (
            "Physical Harmonization",
            "physical_harmonization"
        ),

        (
            "Nadi Analysis",
            "nadi_analysis"
        ),

        (
            "Bhakoot Analysis",
            "bhakoot_analysis"
        ),

        (
            "Family and Married Life",
            "family_and_married_life"
        ),

        (
            "Wealth and Prosperity",
            "wealth_and_prosperity"
        ),

        (
            "Major Strengths",
            "major_strengths"
        ),

        (
            "Major Challenges",
            "major_challenges"
        ),

        (
            "Conflict Resolution",
            "conflict_resolution"
        ),

        (
            "Vedic Remedies",
            "vedic_remedies"
        ),

        (
            "Final Assessment",
            "final_assessment"
        ),
    ]

    # =========================================================
    # RENDER SECTIONS
    # =========================================================

    for title, key in sections:

        value = synthesis.get(key)

        if value is None:
            continue

        story.append(
            Paragraph(
                _pdf_text(title),
                heading_style
            )
        )

        # -----------------------------------------------------
        # LIST
        # -----------------------------------------------------

        if isinstance(value, list):

            if not value:

                story.append(
                    Paragraph(
                        "No information available.",
                        body_style
                    )
                )

                continue

            for item in value:

                if isinstance(item, dict):

                    parts = []

                    for k, v in item.items():

                        if isinstance(v, list):

                            v = ", ".join(
                                str(x)
                                for x in v
                            )

                        parts.append(
                            f"<b>{_pdf_text(k)}:</b> "
                            f"{_pdf_text(v)}"
                        )

                    text = "<br/>".join(parts)

                else:

                    text = _pdf_text(item)

                story.append(
                    Paragraph(
                        f"• {text}",
                        bullet_style
                    )
                )

        # -----------------------------------------------------
        # DICTIONARY
        # -----------------------------------------------------

        elif isinstance(value, dict):

            for k, v in value.items():

                if isinstance(v, list):

                    if v:

                        v = ", ".join(
                            str(x)
                            for x in v
                        )

                    else:

                        v = "None"

                elif isinstance(v, dict):

                    v = json.dumps(
                        v,
                        ensure_ascii=False
                    )

                story.append(
                    Paragraph(
                        (
                            f"<b>{_pdf_text(k)}:</b> "
                            f"{_pdf_text(v)}"
                        ),
                        body_style
                    )
                )

        # -----------------------------------------------------
        # STRING / NUMBER
        # -----------------------------------------------------

        else:

            story.append(
                Paragraph(
                    _pdf_text(value),
                    body_style
                )
            )

    # =========================================================
    # DISCLAIMER
    # =========================================================

    story.append(
        Spacer(1, 12)
    )

    story.append(
        Paragraph(
            (
                "<b>Disclaimer:</b> "
                "This report is based on the supplied "
                "Vedic astrology data and traditional "
                "Jyotish compatibility framework. "
                "It should not be considered a scientifically "
                "proven guarantee of relationship or marital "
                "outcomes."
            ),
            body_style
        )
    )

    # =========================================================
    # BUILD PDF
    # =========================================================

    doc.build(story, onFirstPage=_draw_page_decorations, onLaterPages=_draw_page_decorations)

    pdf_bytes = buffer.getvalue()

    buffer.close()

    return pdf_bytes

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
