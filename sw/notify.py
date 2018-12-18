from pywebpush import webpush

def notify(s):
    null = None;
    webpush({"endpoint":"https://fcm.googleapis.com/fcm/send/d-EtkxhGR1k:APA91bHlOoiXYpixpzKpQA2uguep0cBulvWQYufO5LBjtRBzGT-Mya8RgU_FqizsIvMYq4-1LeHDSex59wvxZf-IqdAyqcPFrGUmuq4Qzje7UWMtl0AprkTtiHXnbbMwJ-w8meIjaw5A","expirationTime":null,"keys":{"p256dh":"BB-2-K1vFYto5bP4C6pfpsoOHkNca2hyhLFJfLKE5OxuoiHowKBnbYZrPpqUm1kvMzCnavlpwKPjJkZkCfFlk6E","auth":"Ao2UTiJeKAHZT5SdT9M0fQ"}},s,vapid_private_key="R87DofLRRFS_eC2WazotxQ2AB1u8XeW36bK9mCUCQgs",vapid_claims={"sub":"mailto:gsitcia@gmail.com"});