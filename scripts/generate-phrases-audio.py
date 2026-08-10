from gtts import gTTS
import os

phrases = [
  {"id": "phrase-umm-jadda", "arabic": "أم وجدة"},
  {"id": "phrase-ab-sadiq", "arabic": "أب وصديق"},
  {"id": "phrase-walad-saghir", "arabic": "ولد صغير"},
  {"id": "phrase-bint-jamil", "arabic": "بنت صغيرة"},
  {"id": "phrase-bayt-kabir", "arabic": "بيت كبير"},
  {"id": "phrase-bab-jadid", "arabic": "باب جديد"},
  {"id": "phrase-ghurfa-kabira", "arabic": "غرفة كبيرة"},
  {"id": "phrase-miftah-saghir", "arabic": "مفتاح صغير"},
  {"id": "phrase-kursi-jadid", "arabic": "كرسي جديد"},
  {"id": "phrase-shay-qahwa", "arabic": "شاي وقهوة"},
  {"id": "phrase-khubz-jubn", "arabic": "خبز وجبن"},
  {"id": "phrase-halib-barid", "arabic": "حليب بارد"},
  {"id": "phrase-samak-jadid", "arabic": "سمك طازج"},
  {"id": "phrase-shams-qamar", "arabic": "شمس وقمر"},
  {"id": "phrase-bahr-kabir", "arabic": "بحر كبير"},
  {"id": "phrase-jabal-kabir", "arabic": "جبل كبير"},
  {"id": "phrase-ward-jamil", "arabic": "ورد جميل"},
  {"id": "phrase-ras-qalb", "arabic": "رأس وقلب"},
  {"id": "phrase-ayn-jamil", "arabic": "عين جميلة"},
  {"id": "phrase-kitab-jadid", "arabic": "كتاب جديد"},
  {"id": "phrase-qalam-saghir", "arabic": "قلم صغير"},
  {"id": "phrase-haqiba-kabira", "arabic": "حقيبة كبيرة"},
  {"id": "phrase-hatif-jadid", "arabic": "هاتف جديد"},
  {"id": "phrase-madrasa-kabira", "arabic": "مدرسة كبيرة"},
  {"id": "phrase-suq-kabir", "arabic": "سوق كبير"},
  {"id": "phrase-madina-jamil", "arabic": "مدينة جميلة"},
  {"id": "phrase-masjid-kabir", "arabic": "مسجد كبير"},
  {"id": "phrase-bayt-abyad", "arabic": "بيت أبيض"},
  {"id": "phrase-ward-ahmar", "arabic": "ورد أحمر"},
  {"id": "phrase-bahr-azraq", "arabic": "بحر أزرق"},
  {"id": "phrase-yawm-jamil", "arabic": "يوم جميل"},
  {"id": "phrase-salam-sadiq", "arabic": "سلام وصديق"},
]

out_dir = os.path.join('public', 'audio', 'phrases')
os.makedirs(out_dir, exist_ok=True)

print(f"Generating MP3 audio for {len(phrases)} phrases...")

for item in phrases:
    dest = os.path.join(out_dir, f"{item['id']}.mp3")
    tts = gTTS(text=item['arabic'], lang='ar', slow=False)
    tts.save(dest)
    size = os.path.getsize(dest)
    print(f"OK {item['id']}.mp3 ({size} bytes)")

print("All phrase MP3 audios generated successfully!")
