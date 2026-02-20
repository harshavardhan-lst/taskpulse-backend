def check_fraud(task_summary: str, score: int):
    """
    Simple rule-based fraud detection.
    No heavy ML libraries.
    """

    task_length = len(task_summary)

    # Fraud logic:
    # Very high score but very small task = suspicious
    if score > 95 and task_length < 50:
        return 0.9  # High fraud probability
    else:
        return 0.1  # Low fraud probability