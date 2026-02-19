export function toTurkishUpperCase(str) {
    return str
        .replace(/ı/g, 'I')   // Küçük 'ı' harfini büyük 'I' harfine çevir
        .replace(/i/g, 'İ')   // Küçük 'i' harfini büyük 'İ' harfine çevir
        .toUpperCase();       // Tüm harfleri büyük harfe çevir
}