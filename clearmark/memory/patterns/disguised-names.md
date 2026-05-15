---
slug: disguised-names
title: Penyamaran nama produk di marketplace & medsos
category: naming
severity: high
brands_affected: [viagra]
platforms_seen: [facebook, twitter, instagram, shopee, tokopedia, tiktokshop]
detection_signals:
  - Leetspeak substitusi huruf-angka pada nama brand
  - Penghilangan vokal untuk menghindari filter kata
  - Penambahan kata generik ("obat kuat") sebagai pengganti merek
keywords: ["Vgra", "v14gra", "v14gr4"]
regex_hints:
  - "(?i)v[1i!l|]a?gr[a4]"
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

Penjual produk palsu menyamarkan nama merek terdaftar untuk menghindari pemfilteran kata kunci di marketplace dan media sosial. Substitusi paling umum: angka untuk huruf (`i`→`1`/`!`, `a`→`4`/`@`, `o`→`0`), penghilangan vokal, atau pemecahan kata dengan spasi/titik.

## Contoh terverifikasi (BPOM)

- `Vgra` — penghilangan vokal
- `v14gra` — substitusi `ia`→`14`
- `v14gr4` — substitusi penuh ke leetspeak

## Heuristik deteksi untuk Scanner

1. Cari listing dengan judul yang berjarak edit ≤ 2 dari nama merek terdaftar tapi bukan nama itu sendiri.
2. Flag listing yang memakai pola di atas DAN kata generik ("obat kuat", "perkasa", "tahan lama").
3. Cross-check dengan database NIE BPOM — kalau listing tidak menyertakan NIE valid (`DKI...`), naikkan confidence.

## Catatan

Pola ini ditemukan untuk Viagra/sildenafil, tapi struktur leetspeak generik dan kemungkinan besar berlaku untuk merek obat keras lain yang sering dipalsukan. Saat ada brand baru masuk sebagai project, perluas `brands_affected` di atas dan generate regex baru.
