from django import template

register = template.Library()


@register.filter
def euros(cents):
    """1099900 -> « 10 999,00 € »"""
    if cents is None:
        return ""
    value = f"{int(cents) / 100:,.2f}".replace(",", " ").replace(".", ",")
    return f"{value} €"


@register.filter
def humanize_key(value):
    return str(value).replace("_", " ")
