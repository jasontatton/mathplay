import React, {useState} from 'react';
import {Button, Input, Popover, Space, Typography} from "antd";
import {romanToDecimal} from "./romanUtils"; // from earlier helper file

const {Text} = Typography;

// Roman keypad buttons
const romanSymbols = ["I", "V", "X", "L", "C", "D", "M"];

const RomanNumerals: React.FC = () => {
    const [romanValue, setRomanValue] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [visible, setVisible] = useState(false);

    const validateRoman = (value: string) => {
        const dec = romanToDecimal(value);
        if (value && dec === null) {
            setError("Invalid Roman numeral format");
        } else {
            setError(null);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.toUpperCase();
        setRomanValue(val);
        validateRoman(val);
    };

    const handleSymbolClick = (symbol: string) => {
        const newValue = romanValue + symbol;
        setRomanValue(newValue);
        validateRoman(newValue);
    };


    const handleBack = () => {
        if (romanValue) {
            const newValue = romanValue.substring(0, romanValue.length - 1);
            setRomanValue(newValue);
            validateRoman(newValue);
        }
    };

    const handleClear = () => {
        setRomanValue("");
        setError(null);
    };

    const keypadContent = (
        <div style={{width: 220}}>
            <Space wrap style={{marginBottom: 8}}>
                {romanSymbols.map((symbol) => (
                    <Button
                        key={symbol}
                        type="default"
                        style={{width: 60, height: 48, fontSize: 20}}
                        onClick={() => handleSymbolClick(symbol)}
                    >
                        {symbol}
                    </Button>
                ))}
            </Space>
            <Space style={{width: "100%"}}>
                <Button block onClick={handleBack}>
                    Back
                </Button>
                <Button danger block onClick={handleClear}>
                    Clear
                </Button>
                <Button
                    type="primary"
                    block
                    onClick={() => setVisible(false)}
                >
                    Close
                </Button>
            </Space>
        </div>
    );

    const currentDecimalValue = romanToDecimal(romanValue);

    return (
        <div style={{padding: 5}}>
            heard mode, no showing suffix
            <Popover
                content={keypadContent}
                title="Roman Keypad"
                trigger="click"
                placement="bottomLeft"
                open={visible}
                onOpenChange={(v) => setVisible(v)}
            >
                <Input
                    value={romanValue}
                    onChange={handleInputChange}
                    placeholder="Enter or build Roman numeral"
                    style={{
                        maxWidth: 300,
                        color: error ? 'red' : 'black',
                        borderColor: error ? 'red' : undefined,
                        boxShadow: error ? '0 0 0 2px rgba(255, 0, 0, 0.2)' : undefined
                    }}

                    suffix={
                        !isNaN(currentDecimalValue as number) && currentDecimalValue !== null ? (
                            <span style={{color: '#999'}}>{currentDecimalValue}</span>
                        ) : (error && '🤢')
                    }

                    readOnly={true} // stops keyboard
                    onFocus={(e) => {
                        if (/Mobi|Android/i.test(navigator.userAgent)) e.target.blur();
                    }}
                />
            </Popover>

            {/* Validation/Error feedback */}
            {error && <Text type="danger" style={{display: "block"}}>{error}</Text>}
        </div>
    );
};


export default RomanNumerals;