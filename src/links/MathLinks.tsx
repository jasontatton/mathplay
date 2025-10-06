import React from "react";
import {Card, Image, List, Typography} from "antd";

const {Link, Text} = Typography;

interface Resource {
    title: string;
    description: string;
    url: string;
    image?: string; // Optional image URL
}

const resources: Resource[] = [
    {
        title: "BBC Bitesize KS2",
        description: "BBC Bitesize KS2 Maths for Years 3-6",
        url: "https://www.bbc.co.uk/bitesize/subjects/z826n39",
        image: "https://bitesize.files.bbci.co.uk/images/svgs/subjects/v4/z826n39.svg"
    },
    {
        title: "Guardians: Defenders of Mathematica",
        description: "Play Guardians: Defenders of Mathematica to add, subtract, divide and multiply your way to victory across 11 different maths topics.",
        url: "https://www.bbc.co.uk/bitesize/topics/zd2f7nb/articles/zn2y7nb#zqpjg2p",
        image: "https://ichef.bbci.co.uk/images/ic/480xn/p0jwtkxf.png"
    },
];

export default function MathLinks() {
    return (
        <Card
            title="KS2 Math Learning Resources"
            bodyStyle={{padding: "0"}}
            style={{
                maxWidth: 600,
                margin: "auto",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
            }}
        >
            <List
                itemLayout="vertical"
                dataSource={resources}
                renderItem={(item) => (
                    <List.Item style={{padding: "16px"}}>
                        <div style={{display: "flex", alignItems: "center", gap: "12px"}}>
                            {item.image && (
                                <Image
                                    src={item.image}
                                    alt={`${item.title} logo`}
                                    width={48}
                                    height={48}
                                    style={{borderRadius: 8, objectFit: "contain"}}
                                    preview={false}
                                />
                            )}
                            <div style={{flex: 1}}>
                                <Link
                                    href={item.url}
                                    target="_blank"
                                    style={{fontSize: "1.1rem", fontWeight: "bold"}}
                                >
                                    {item.title}
                                </Link>
                                <Text
                                    type="secondary"
                                    style={{display: "block", marginTop: "4px"}}
                                >
                                    {item.description}
                                </Text>
                            </div>
                        </div>
                    </List.Item>
                )}
            />
        </Card>
    );
}