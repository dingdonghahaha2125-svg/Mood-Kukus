# Security Specification for Mood Kukus Mamuju POS & Inventory App

## 1. Data Invariants
- All collection items (`stockItems`, `sauceItems`, `menuItems`, `transactions`, `expenses`, `dailyReports`) must match valid schema formats.
- For public operational usage (Point of Sale counter staff & store managers), read and write operations are permitted for authenticated or authorized store operations, with strict string length and type validations.
- Document IDs must pass character pattern matching `^[a-zA-Z0-9_\-]+$` and length constraints (<= 128 characters).

## 2. Dirty Dozen Test Payloads
1. **Unbounded String Injection**: `{ "name": "A".repeat(1000) }` -> Expect `PERMISSION_DENIED`
2. **Invalid Category Enum**: `{ "category": "invalid_category" }` -> Expect `PERMISSION_DENIED`
3. **Negative Price/Amount**: `{ "price": -50000 }` -> Expect `PERMISSION_DENIED`
4. **Invalid Document ID Path**: Document ID `../../admin` -> Expect `PERMISSION_DENIED`
5. **Junk Fields / Shadow Fields**: `{ "isOwner": true, "name": "Bahan" }` -> Expect `PERMISSION_DENIED`
6. **Null/Non-String ID**: `{ "id": 12345 }` -> Expect `PERMISSION_DENIED`
7. **Type Mismatch on Numeric Stock**: `{ "currentStock": "ten" }` -> Expect `PERMISSION_DENIED`
8. **Invalid Date Format**: `{ "date": 9999999 }` -> Expect `PERMISSION_DENIED`
9. **Invalid Payment Method**: `{ "paymentMethod": "bitcoin" }` -> Expect `PERMISSION_DENIED`
10. **Malicious Script in Notes**: `{ "notes": "<script>alert(1)</script>" + "A".repeat(2000) }` -> Expect `PERMISSION_DENIED`
11. **Negative HPP**: `{ "totalHpp": -100 }` -> Expect `PERMISSION_DENIED`
12. **Missing Required Fields on Create**: `{ "name": "Pisang" }` -> Expect `PERMISSION_DENIED`
