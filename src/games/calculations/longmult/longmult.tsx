import React, {JSX, useState} from 'react';
import {Button, Card, InputNumber, Space, Typography} from 'antd';
import 'antd/dist/reset.css';

const {Title} = Typography;

export default function LongMultiplicationInteractiveSteps() {
    const [num1, setNum1] = useState<number | null>(null);
    const [num2, setNum2] = useState<number | null>(null);
    const [rows, setRows] = useState<JSX.Element[]>([]);
    const [currentStep, setCurrentStep] = useState<number>(0);

    const padLeft = (value: string, totalLength: number) =>
        Array(Math.max(totalLength - value.length, 0))
            .fill('')
            .concat(value.split(''));

    const renderRow = (
        cells: (string | JSX.Element)[],
        type: 'bold' | 'divider' | 'partial' | 'carry'
    ) => {
        const cellStyle: React.CSSProperties = {
            width: '2rem',
            height: '2rem',
            padding: '0.25rem',
        };

        return (
            <tr>
                {cells.map((cell, idx) => (
                    <td
                        key={idx}
                        style={{
                            ...cellStyle,
                            fontWeight: type === 'bold' ? 'bold' : 'normal',
                            borderBottom:
                                type === 'divider' ? '2px solid black' : '1px solid #ccc',
                            backgroundColor:
                                type === 'carry'
                                    ? '#fff7e6'
                                    : type === 'partial'
                                        ? '#e6f7ff'
                                        : undefined,
                            fontSize: type === 'carry' ? '0.8em' : '1em',
                            color: type === 'carry' ? '#fa8c16' : undefined,
                            textAlign: 'center',
                        }}
                    >
                        {cell}
                    </td>
                ))}
            </tr>
        );
    };

    const generateRows = () => {
        if (num1 == null || num2 == null) return;

        const aDigits = num1.toString().split('').map(Number);
        const bDigits = num2.toString().split('').map(Number);
        const cols = Math.max(aDigits.length, bDigits.length) + bDigits.length;
        const allRows: JSX.Element[] = [];
        const partials: string[][] = [];

        // Multiplicand and multiplier
        allRows.push(renderRow(padLeft(num1.toString(), cols), 'bold'));
        allRows.push(renderRow(padLeft(num2.toString(), cols), 'bold'));
        allRows.push(renderRow(Array(cols).fill('─'), 'divider'));

        // Each partial product
        bDigits
            .slice()
            .reverse()
            .forEach((digitB, idxB) => {
                const carryRow: (string | JSX.Element)[] = Array(cols).fill('');
                const partialRow: string[] = Array(cols).fill('');
                let carry = 0;

                for (let i = 0; i < aDigits.length; i++) {
                    const idxFromRight = cols - 1 - i - idxB;
                    const digitA = aDigits[aDigits.length - 1 - i];
                    const product = digitA * digitB + carry;
                    const unit = product % 10;
                    carry = Math.floor(product / 10);
                    partialRow[idxFromRight] = unit.toString();
                    if (carry > 0 && idxFromRight - 1 >= 0) {
                        carryRow[idxFromRight - 1] = <sub>{carry}</sub>;
                    }
                }
                if (carryRow.some((c) => c !== '')) {
                    allRows.push(renderRow(carryRow, 'carry'));
                }
                allRows.push(renderRow(partialRow, 'partial'));
                partials.push(partialRow);
            });

        allRows.push(renderRow(Array(cols).fill('─'), 'divider'));

        // Addition step
        const sumRow: string[] = Array(cols).fill('');
        let carryAdd = 0;
        for (let col = cols - 1; col >= 0; col--) {
            const colSum =
                partials.reduce(
                    (sum, part) => sum + (part[col] ? parseInt(part[col], 10) : 0),
                    0
                ) + carryAdd;
            const unit = colSum % 10;
            carryAdd = Math.floor(colSum / 10);
            sumRow[col] = unit.toString();
        }
        if (carryAdd > 0) {
            const addCarryRow: (string | JSX.Element)[] = Array(cols).fill('');
            addCarryRow[0] = <sub>{carryAdd}</sub>;
            allRows.push(renderRow(addCarryRow, 'carry'));
        }
        allRows.push(renderRow(sumRow, 'bold'));

        setRows(allRows);
        setCurrentStep(1); // start showing the first step
    };

    const tableStyle: React.CSSProperties = {
        borderCollapse: 'collapse',
        marginTop: '1rem',
        width: '100%',
    };

    return (
        <Card style={{maxWidth: 600, margin: '2rem auto'}}>
            <Title level={4}>Long Multiplication - Step by Step</Title>
            <p>Enter two numbers and click through the calculation steps.</p>
            <Space style={{marginBottom: '1rem'}}>
                <InputNumber
                    min={0}
                    value={num1 ?? undefined}
                    onChange={setNum1}
                    placeholder="First number"
                />
                <InputNumber
                    min={0}
                    value={num2 ?? undefined}
                    onChange={setNum2}
                    placeholder="Second number"
                />
                <Button type="primary" onClick={generateRows}>
                    Start
                </Button>
            </Space>

            {rows.length > 0 && (
                <>
                    <table style={tableStyle}>
                        <tbody>{rows.slice(0, currentStep)}</tbody>
                    </table>

                    <Space style={{marginTop: '1rem'}}>
                        <Button
                            disabled={currentStep <= 1}
                            onClick={() =>
                                setCurrentStep((s) => Math.max(1, s - 1))
                            }
                        >
                            Previous
                        </Button>
                        <Button
                            disabled={currentStep >= rows.length}
                            onClick={() =>
                                setCurrentStep((s) => Math.min(rows.length, s + 1))
                            }
                        >
                            Next
                        </Button>
                    </Space>
                </>
            )}
        </Card>
    );
}