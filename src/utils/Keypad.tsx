import React, {useCallback, useState} from 'react';
import {Button, Input, Popover, Space, Typography} from "antd";
import {romanToDecimal} from "../games/romanNumerals/utils/roman";

const {Text} = Typography;

// Roman keypad buttons
const romanSymbols = ["I", "V", "X", "L", "C", "D", "M"];
const decimalSymbols = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];


export function useKeyPad(onSelect: (_opt: number | string) => void, roman: boolean, hint: boolean) {
    const [theValue, setTheValue] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [visible, setVisible] = useState(false);
    const [disabled, setDisabled] = useState(false);

    const rtext = roman ? 'Roman numeral' : 'decimal';

    const validateRoman = (value: string) => {
        const dec = roman ? romanToDecimal(value) : parseInt(value);
        if (value && dec === null) {
            setError(`Invalid ${rtext} format`);
        } else {
            setError(null);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.toUpperCase();
        setTheValue(val);
        validateRoman(val);
    };

    const handleSymbolClick = (symbol: string) => {
        const newValue = theValue + symbol;
        setTheValue(newValue);
        validateRoman(newValue);
    };


    const handleBack = () => {
        if (theValue) {
            const newValue = theValue.substring(0, theValue.length - 1);
            setTheValue(newValue);
            validateRoman(newValue);
        }
    };

    const handleClear = useCallback(() => {
        setTheValue("");
        setError(null);
        setDisabled(false);
    }, []);

    const handleReset = useCallback(() => {
        handleClear();
    }, []);

    const symbols = roman ? romanSymbols : decimalSymbols;

    const disable = useCallback(() => {
        setDisabled(true);
    }, []);

    function onSubmit() {
        disable();
        onSelect(roman ? theValue : Number(theValue));
        setVisible(false);
    }

    const keypadContent = (
        <div style={{width: 220}}>
            <Space wrap style={{marginBottom: 8}}>
                {symbols.map((symbol) => (
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
                    onClick={onSubmit}
                >
                    Submit
                </Button>
            </Space>
        </div>
    );

    const currentDecimalValue = roman ? romanToDecimal(theValue) : parseInt(theValue);

    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    const Pad = () => {
        return (
            <div style={{padding: 5}}>
                <Popover
                    content={keypadContent}
                    trigger="click"
                    placement="bottomLeft"
                    open={visible}
                    onOpenChange={(v) => setVisible(v)}
                >
                    <Input
                        allowClear
                        value={theValue}
                        onChange={handleInputChange}
                        placeholder={`Enter or build ${rtext}`}
                        style={{
                            maxWidth: 300,
                            color: error ? 'red' : 'black',
                            borderColor: error ? 'red' : undefined,
                            boxShadow: error ? '0 0 0 2px rgba(255, 0, 0, 0.2)' : undefined
                        }}

                        disabled={disabled}

                        suffix={
                            (!roman || !hint) ? undefined :
                                !isNaN(currentDecimalValue as number) && currentDecimalValue !== null ? (
                                    <span style={{color: '#999'}}>{currentDecimalValue}</span>
                                ) : (error && '🤢')
                        }

                        onPressEnter={onSubmit}

                        readOnly={isMobile} // stops keyboard
                        onFocus={(e) => {
                            if (isMobile) e.target.blur();
                        }}
                    />
                </Popover>

                {/* Validation/Error feedback */}
                {error && <Text type="danger" style={{display: "block"}}>{error}</Text>}

                <Button type="primary" disabled={disabled} block
                        onClick={() => onSelect(theValue)}>
                    Submit
                </Button>

            </div>
        );
    };

    return {theValue, handleReset, Pad, disable}
}

export function useRomanKeypad(onSelect: (_: number | string) => void, hint: boolean) {
    return useKeyPad(onSelect, true, hint);
}


export function useDecimalKeypad(onSelect: (_: number | string) => void) {
    return useKeyPad(onSelect, false, false);
}