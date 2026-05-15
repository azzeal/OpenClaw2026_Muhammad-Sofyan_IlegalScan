---
slug: kios-labels
title: Label kios/gerobak luring penjual obat ilegal
category: offline-signal
severity: medium
brands_affected: [viagra]
platforms_seen: [physical, instagram-stories, tiktok-videos]
detection_signals:
  - Kios pinggir jalan / gerobak dengan papan nama bertuliskan label di bawah
keywords: ["OBAT KUAT", "PERKASA", "JANTAN", "VITALITAS"]
source:
  type: bpom_publication
  title: "Lampiran 1. Informasi Detil Produk Obat Palsu VIAGRA"
  ref: "Siaran Pers HM.01.1.2.12.25.19"
  date: "2025-12-29"
  file: "projects/pfizer-indonesia/evidence/bpom-viagra-palsu.pdf"
learned_at: "2026-05-15T08:30:00+07:00"
learned_by: analyst
confidence: high
---

## Pola

BPOM mendokumentasikan bahwa kios/gerobak ilegal yang menjual Viagra palsu di Indonesia ditandai dengan papan nama bertuliskan keywords di atas. Ini adalah sinyal **luring** — tidak langsung relevan untuk Scanner e-commerce, tetapi:

1. Sering muncul di **konten visual** medsos (foto/video toko di Instagram, TikTok, Facebook) yang dipakai penjual daring untuk meyakinkan pembeli bahwa mereka "punya toko fisik".
2. Bisa jadi label deskripsi seller di marketplace ("Kios Obat Kuat Pak Anu").
3. Konteks untuk laporan ke BPOM — kalau Scanner menemukan listing daring dengan foto papan nama berbunyi keywords ini, severity laporan naik.

## Heuristik

Saat menganalisis gambar listing atau foto profil seller, OCR + match keywords. Kalau hit, naikkan confidence finding sebanyak +20%.

## Catatan

Pattern ini berguna untuk Analyst saat mengkorelasikan beberapa finding dari seller yang sama (kemungkinan jaringan distribusi).
