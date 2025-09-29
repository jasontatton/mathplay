import React from "react";
import {useNavigate} from "react-router-dom";
import {Button, Col, Image, Row} from "antd";
import {Path, PathToName} from "./PathToName";

export type PButton = {
    route: Path;
    image: string;
}

type ButtonPanelProps = {
    pButtons: PButton[];
};

export function ButtonPanel({pButtons}: ButtonPanelProps) {
    const navigate = useNavigate();


    return (
        <Row gutter={[16, 16]} justify="center">
            {pButtons.map((btn, index) => (
                <Col xs={24} sm={12} md={6} key={index}>
                    <Button
                        type="primary"
                        style={{
                            width: '100%',
                            height: '200px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        onClick={() => navigate(btn.route)}
                    >
                        <Image
                            src={btn.image}
                            preview={false}
                            style={{width: 80, height: 80, marginBottom: 8}}
                        />
                        {PathToName[btn.route]}
                    </Button>
                </Col>
            ))}
        </Row>
    );
}