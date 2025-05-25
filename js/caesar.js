/*
 * Crypto Monocle
 * Автор: Sira4110
 * GitHub: https://github.com/Sira4110/Diplom_Sira4110
 * Ліцензія: MIT
 */

class CaesarCipher {
    constructor() {
        this.encryptedTextResult = null;
        this.decryptedTextResult = null;
        
        this.minCharCode = 0;
        this.maxCharCode = 65535;
        this.totalChars = this.maxCharCode - this.minCharCode + 1;
        
        this.messages = {
            en: {
                enterText: "Please enter text to encrypt!",
                enterValidShift: "Please enter a valid positive shift value!",
                encryptedCopied: "Encrypted text copied to clipboard!",
                decryptedCopied: "Decrypted text copied to clipboard!",
                selectFile: "Please select a file to encrypt!",
                selectEncryptedFile: "Please select a file to decrypt!",
                copyFailed: "Failed to copy text: ",
                fileExtensionError: "Error: File must be in .txt format"
            },
            ua: {
                enterText: "Будь ласка, введіть текст для шифрування!",
                enterValidShift: "Будь ласка, введіть дійсне позитивне значення зсуву!",
                encryptedCopied: "Зашифрований текст скопійовано до буфера обміну!",
                decryptedCopied: "Дешифрований текст скопійовано до буфера обміну!",
                selectFile: "Будь ласка, виберіть файл для шифрування!",
                selectEncryptedFile: "Будь ласка, виберіть файл для дешифрування!",
                copyFailed: "Не вдалося скопіювати текст: ",
                fileExtensionError: "Помилка: Файл має бути у форматі .txt"
            }
        };
    }
    
    getCurrentLanguage() {
        return localStorage.getItem('lang') || 'en';
    }
    
    getMessage(key) {
        const lang = this.getCurrentLanguage();
        return this.messages[lang][key] || this.messages['en'][key];
    }
    
    // --- Новий метод для перевірки розширення файлу ---
    checkFileExtension(file) {
        const allowedExtensions = ['txt', 'text'];
        const extension = file.name.split('.').pop().toLowerCase();

        if (!allowedExtensions.includes(extension)) {
            alert(this.getMessage('fileExtensionError'));
            return false;
        }
        return true;
    }
    
    encryptCaesar(text, shift) {
        shift = ((shift % this.totalChars) + this.totalChars) % this.totalChars;
        let result = '';
        for (let i = 0; i < text.length; i++) {
            let charCode = text.charCodeAt(i);
            if (charCode >= this.minCharCode && charCode <= this.maxCharCode) {
                let shiftedCode = ((charCode - this.minCharCode + shift) % this.totalChars) + this.minCharCode;
                result += String.fromCharCode(shiftedCode);
            } else {
                result += text[i];
            }
        }
        return result;
    }
    
    decryptCaesar(text, shift) {
        shift = ((shift % this.totalChars) + this.totalChars) % this.totalChars;
        return this.encryptCaesar(text, this.totalChars - shift);
    }
    
    encryptText() {
        const textInput = document.getElementById('inputText').value;
        if (!textInput) {
            return alert(this.getMessage('enterText'));
        }
        
        const shift = parseInt(document.getElementById('shiftInput').value);
        if (isNaN(shift) || shift < 1) {
            return alert(this.getMessage('enterValidShift'));
        }
        
        this.encryptedTextResult = this.encryptCaesar(textInput, shift);
        document.getElementById('encryptedTextArea').value = this.encryptedTextResult;
        document.getElementById('encryptionResults').style.display = 'block';
    }
    
    decryptText() {
        const encryptedInput = document.getElementById('encryptedInput').value;
        if (!encryptedInput) {
            return alert(this.getMessage('enterText'));
        }
        
        const shift = parseInt(document.getElementById('decryptShiftInput').value);
        if (isNaN(shift) || shift < 1) {
            return alert(this.getMessage('enterValidShift'));
        }
        
        this.decryptedTextResult = this.decryptCaesar(encryptedInput, shift);
        this.showDecryptedResult(this.decryptedTextResult);
    }
    
    encryptFile() {
        let fileInput = document.getElementById('inputFile').files[0];
        if (!fileInput) {
            return alert(this.getMessage('selectFile'));
        }
        
        if (!this.checkFileExtension(fileInput)) {
            return; // Якщо файл не підходить - зупиняємо виконання
        }
        
        const shift = parseInt(document.getElementById('fileShiftInput').value);
        if (isNaN(shift) || shift < 1) {
            return alert(this.getMessage('enterValidShift'));
        }
        
        let reader = new FileReader();
        reader.onload = (event) => {
            let text = event.target.result;
            let encryptedText = this.encryptCaesar(text, shift);
            this.downloadFile(encryptedText, 'encrypted_' + fileInput.name);
        };
        reader.readAsText(fileInput);
    }
    
    decryptFile() {
        let encryptedFile = document.getElementById('encryptedFile').files[0];
        if (!encryptedFile) {
            return alert(this.getMessage('selectEncryptedFile'));
        }
        
        if (!this.checkFileExtension(encryptedFile)) {
            return;
        }
        
        const shift = parseInt(document.getElementById('fileDecryptShiftInput').value);
        if (isNaN(shift) || shift < 1) {
            return alert(this.getMessage('enterValidShift'));
        }
        
        let reader = new FileReader();
        reader.onload = (event) => {
            let text = event.target.result;
            let decryptedText = this.decryptCaesar(text, shift);
            this.showDecryptedResult(decryptedText);
            this.decryptedTextResult = decryptedText;
        };
        reader.readAsText(encryptedFile);
    }
    
    showDecryptedResult(text) {
        document.getElementById('decryptedTextArea').value = text;
        document.getElementById('decryptionResult').style.display = 'block';
    }
    
    copyEncryptedText() {
        const textArea = document.getElementById('encryptedTextArea');
        if (textArea && textArea.value) {
            this.copyToClipboard(textArea.value);
            alert(this.getMessage('encryptedCopied'));
        }
    }
    
    copyDecryptedText() {
        const textArea = document.getElementById('decryptedTextArea');
        if (textArea && textArea.value) {
            this.copyToClipboard(textArea.value);
            alert(this.getMessage('decryptedCopied'));
        }
    }
    
    downloadEncryptedText() {
        const textArea = document.getElementById('encryptedTextArea');
        if (textArea && textArea.value) {
            this.downloadFile(textArea.value, 'encrypted_text.txt');
        }
    }
    
    downloadDecryptedText() {
        const textArea = document.getElementById('decryptedTextArea');
        if (textArea && textArea.value) {
            this.downloadFile(textArea.value, 'decrypted_text.txt');
        }
    }
    
    copyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
        } catch (err) {
            console.error(this.getMessage('copyFailed'), err);
        }
        
        document.body.removeChild(textArea);
    }
    
    downloadFile(text, filename) {
        const blob = new Blob([text], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

const caesarCipher = new CaesarCipher();
