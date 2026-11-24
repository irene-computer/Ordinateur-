from django.http import HttpResponse


class ApiCorsMiddleware:
    """Autorise l'app mobile (et sa version web Expo) à appeler /api/."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if not request.path.startswith("/api/"):
            return self.get_response(request)
        response = HttpResponse(status=204) if request.method == "OPTIONS" else self.get_response(request)
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return response
