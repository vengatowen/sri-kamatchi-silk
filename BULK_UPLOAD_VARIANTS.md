# Bulk upload + colour variants

## CSV rules (same columns as before)

| Column | Notes |
|--------|--------|
| Product Name | **Same name** on multiple rows = one product with colour variants |
| Price / Discount Price | Taken from the **first row** of that product (same price for all colours) |
| Stock | Per colour (each row) |
| Color | Required for variants (e.g. Red, Green) |
| Image URL | Full URL **or** filename only |

## Image filenames (cPanel)

Upload files manually to:

`public_html/uploads/products/`

on `img.srikamatchisilks.com`.

In CSV you can write:

- `1.jpg`
- `pochampalli-red-1.jpg|pochampalli-red-2.jpg` (gallery for one colour, use `|`)

The system builds:

`https://img.srikamatchisilks.com/uploads/products/1.jpg`

## Example

Three rows, same Product Name, different Color + Image URL → one product page with 3 colour swatches.
