export  function formatPhoneNumber(input, previousValue = '') {
    const numbers = input.replace(/\D/g, '');
    
 debugger

    // Eğer yeni girdi eski değerden daha kısa ise (yani silme yapıldıysa), son karakteri kırp
    if (numbers?.length < previousValue.replace(/\D/g, '').length) {
        return previousValue.slice(0, -1);
    }

    // Başlangıç '0' ise formatı '0 (...) ... .. ..' şeklinde yap, değilse '(...) ... .. ..' şeklinde
    const formatted = numbers?.startsWith('0')
        ? `0 (${numbers.slice(1, 4).padEnd(3, '_')}) ${numbers.slice(4, 7).padEnd(3, '_')} ${numbers.slice(7, 9).padEnd(2, '_')} ${numbers.slice(9, 11).padEnd(2, '_')}`
        : `(${numbers.slice(0, 3).padEnd(3, '_')}) ${numbers.slice(3, 6).padEnd(3, '_')} ${numbers.slice(6, 8).padEnd(2, '_')} ${numbers.slice(8, 10).padEnd(2, '_')}`;

    return formatted;  

}