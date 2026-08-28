from flask import jsonify


def get_sample_data():
    return jsonify({
        "status": "success",
        "data": {
            "message": "JyotishVeda API is healthy",
        },
    })
