const CHAR_SETS = {
  LOWERCASE: 'abcdefghijklmnopqrstuvwxyz',
  UPPERCASE: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  NUMBERS: '0123456789',
  SPECIAL: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

// Function to get a random character from a string
const getRandomChar = (str: string): string => {
    const random_bytes = new Uint32Array(1);
    crypto.getRandomValues(random_bytes);
    return str[random_bytes[0] % str.length];
};

interface PasswordOptions {
    length?: number;
    includeUppercase?: boolean;
    includeLowercase?: boolean;
    includeNumbers?: boolean;
    includeSpecial?: boolean;
}

export const generateStrongPassword = (options: PasswordOptions = {}): string => {
    const {
        length = 14,
        includeUppercase = true,
        includeLowercase = true,
        includeNumbers = true,
        includeSpecial = true,
    } = options;

    if (length < 8) throw new Error('Password length must be at least 8 characters.');

    // FIX: Refactored `charSets` array initialization to be built imperatively.
    // This avoids a TypeScript type-widening issue where string literals were incorrectly
    // inferred as `string`, causing a type mismatch with `keyof PasswordOptions`.
    const charSets: { type: keyof PasswordOptions; chars: string }[] = [];
    if (includeLowercase) {
        charSets.push({ type: 'includeLowercase', chars: CHAR_SETS.LOWERCASE });
    }
    if (includeUppercase) {
        charSets.push({ type: 'includeUppercase', chars: CHAR_SETS.UPPERCASE });
    }
    if (includeNumbers) {
        charSets.push({ type: 'includeNumbers', chars: CHAR_SETS.NUMBERS });
    }
    if (includeSpecial) {
        charSets.push({ type: 'includeSpecial', chars: CHAR_SETS.SPECIAL });
    }

    if (charSets.length === 0) {
        return '';
    }

    let password = '';
    // Ensure at least one character from each included set
    charSets.forEach(set => {
        password += getRandomChar(set.chars);
    });

    // Build the full character pool for the rest of the password
    const allChars = charSets.map(set => set.chars).join('');

    // Fill the rest of the password length
    for (let i = password.length; i < length; i++) {
        password += getRandomChar(allChars);
    }

    // Shuffle the password to make the positions of required characters random
    const passwordArray = password.split('');
    for (let i = passwordArray.length - 1; i > 0; i--) {
        const random_bytes = new Uint32Array(1);
        crypto.getRandomValues(random_bytes);
        const j = random_bytes[0] % (i + 1);
        [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
    }

    return passwordArray.join('');
};