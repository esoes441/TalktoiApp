import React, { useEffect } from 'react';
import Tts from 'react-native-tts';

// Nesne isimlerini kullanıcıya dostça çevirme
const objectLabels = {
  garbage_bin: "çöp kutusu",
  crosswalk: "yaya geçidi",
  stairs: "merdiven",
  stop_go_block: "engelli rampası"
};

const directionLabels = {
  sol: "solunuzda",
  sağ: "sağınızda",
  ön: "önünüzde"
};


// Yarımlara göre mesafeyi okunaklı hale getir
const roundDistanceToReadable = (distance) => {
  const floor = Math.floor(distance);
  const diff = distance - floor;

  // 0.5'ten küçük tüm değerleri 0.5'e yuvarla
  if (distance < 0.5) {
    return 0.5;
  }

  // Geri kalanı yarımlara göre yuvarla
  if (diff < 0.25) {
    return floor; // Örnek: 1.2 → 1
  } else if (diff < 0.75) {
    return floor + 0.5; // Örnek: 1.3 → 1.5
  } else {
    return floor + 1; // Örnek: 1.8 → 2
  }
};

const VoiceOutput = ({ message }) => {
  useEffect(() => {
    if (message?.data?.object && message?.data?.direction && message?.data?.distance !== undefined) {
      let { object, direction, distance } = message.data;

      // Sayı değilse number'a çevir
      distance = typeof distance === 'string' ? parseFloat(distance) : distance;

      // Mesafeyi yarıma göre yuvarla
      const roundedDistance = roundDistanceToReadable(distance);

      // Özel durum: tam olarak 0.5 ise "yarım" olarak okunsun
      const isHalf = roundedDistance % 1 === 0.5;

      // Nesne ve yön çevirisini yapalım
      const readableObject = objectLabels[object] || object;
      const readableDirection = directionLabels[direction] || direction;

      // Sesli bildirim metnini oluştur
      let speechText = '';
      if (isHalf) {
        speechText = `${readableObject} bulundu. Yaklaşık yarım metre ileride, ${readableDirection}.`;
      } else {
        speechText = `${readableObject} bulundu. Yaklaşık ${roundedDistance} metre ileride, ${readableDirection}.`;
      }

      console.log("Seslendirilen metin:", speechText);

      // Eski konuşmayı durdur ve yeni konuşmayı başlat
      Tts.stop();
      Tts.speak(speechText);
    } else if (message?.message) {
      // Tespit yoksa genel mesajı oku
      Tts.stop();
      Tts.speak(message.message);
    }
  }, [message]);

  return null;
};

export default VoiceOutput;

