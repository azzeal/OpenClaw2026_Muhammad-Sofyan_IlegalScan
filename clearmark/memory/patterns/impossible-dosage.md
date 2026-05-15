---
slug: impossible-dosage
title: Dosis di luar formulasi resmi (red flag instan)
category: product-spec
severity: critical
brands_affected: [viagra]
platforms_seen: [shopee, tokopedia, facebook, instagram]
detection_signals:
  - "Listing menyebut dosis yang tidak ada di Nomor Izin Edar produk"
  - "Untuk Viagra: dosis selain 25 mg / 50 mg / 100 mg"
keywords: ["500 mg", "800 mg", "1000 mg", "extra strong viagra"]
source:
  type: bpom_publication
  title: "Lampiran 1. Informasi Detil Produk Obat Palsu VIAGRA"
  ref: "Siaran Pers HM.01.1.2.12.25.19"
  date: "2025-12-29"
  file: "projects/pfizer-indonesia/evidence/bpom-viagra-palsu.pdf"
learned_at: "2026-05-15T08:30:00+07:00"
learned_by: analyst
confidence: certain
---

## Pola

Viagra asli (Pfizer Indonesia / Fareva Amboise) hanya diregistrasi BPOM dalam 3 kekuatan:

| Dosis | NIE |
| --- | --- |
| 25 mg | DKI1990401417C1 |
| 50 mg | DKI1690401417A1 |
| 100 mg | DKI1690401417B1 |

Halaman 7-8 dokumen BPOM mendokumentasikan **10 varian palsu** yang ditemukan beredar, termasuk dosis "500 mg", "800 mg", dan "1000 mg" — dosis yang **tidak pernah ada** dalam formulasi resmi dan tidak aman secara farmakologis (sildenafil dosis tinggi memicu risiko kardiovaskular, stroke, priapismus).

## Heuristik deteksi untuk Scanner

Aturan binary, confidence tertinggi:

```
if listing.product ~ "viagra" AND
   listing.dosage NOT IN {"25 mg", "50 mg", "100 mg"}:
       flag as COUNTERFEIT_CERTAIN
```

Tidak perlu cek lain. Dosis di luar formulasi resmi = pasti palsu, untuk produk yang formulasi resminya diketahui.

## Generalisasi untuk brand lain

Pattern ini akan diterapkan ke setiap project baru: simpan formulasi resmi (dari NIE BPOM) sebagai whitelist, flag setiap listing dengan dosis di luar whitelist.
