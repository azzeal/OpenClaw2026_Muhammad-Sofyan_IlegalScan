---
slug: non-psef-sellers
title: Penjual obat keras di luar PSEF (Penyelenggara Sistem Elektronik Farmasi)
category: seller-legitimacy
severity: high
brands_affected: [viagra, all-prescription-drugs]
platforms_seen: [shopee, tokopedia, tiktokshop, facebook, instagram, twitter]
detection_signals:
  - Listing obat keras (resep dokter) dijual oleh seller bukan apotek resmi
  - Tidak ada Nomor Izin Edar (NIE) tertera di deskripsi
  - Tidak ada informasi apoteker penanggung jawab
  - Tidak ada SIPA / izin operasional apotek
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

BPOM secara eksplisit menyatakan bahwa peredaran Viagra palsu daring dilakukan oleh "sarana tidak resmi yang tidak termasuk dalam Penyelenggara Sistem Elektronik Farmasi (PSEF)". Artinya: siapa pun yang menjual obat keras secara daring **wajib** terdaftar sebagai PSEF. Penjual yang tidak terdaftar = ilegal secara default, terlepas dari produk asli atau palsu.

## Heuristik deteksi untuk Scanner

1. Untuk semua produk dalam kategori "Obat Keras" (resep dokter), default-flag listing yang dijual oleh seller tanpa label "Apotek Resmi" / "PSEF Terdaftar" / equivalen marketplace.
2. Whitelisting: list PSEF terdaftar (sumber: BPOM website) → kalau seller bukan PSEF, flag.
3. Untuk Pfizer Viagra: hanya boleh dijual lewat apotek berlisensi dengan resep dokter. Setiap listing marketplace yang menjualnya secara bebas → highly suspect.

## Dasar hukum

UU Nomor 17 Tahun 2023 tentang Kesehatan, Pasal 145 ayat (1): praktik kefarmasian harus dilakukan oleh tenaga berkewenangan. Pelanggaran: pidana penjara s.d. 5 tahun atau denda s.d. Rp500 juta untuk obat keras.

## Catatan

Pattern ini adalah filter paling produktif untuk Scanner — kemungkinan besar menangkap volume terbesar listing yang relevan. Prioritaskan untuk MVP.
