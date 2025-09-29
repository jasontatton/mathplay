import React, {useEffect, useRef, useState} from "react";
import {Button, Card, Typography} from "antd";
import {LeftOutlined, LinkOutlined, RightOutlined} from "@ant-design/icons";

const {Title, Paragraph} = Typography;

interface Book {
    title: string;
    author: string;
    image_url?: string;
    amazon_link?: string;
    synopsis?: string;
}

interface BookListProps {
    books: Book[];
}

const BookList: React.FC<BookListProps> = ({books}) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showLeft, setShowLeft] = useState(false);
    const [showRight, setShowRight] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(1);

    /** Responsive narrower card width */
    const getCardWidth = () => {
        if (window.innerWidth < 768) return window.innerWidth * 0.85;
        if (window.innerWidth < 1024) return window.innerWidth * 0.7;
        return window.innerWidth * 0.5; // narrower for desktop
    };

    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;

        const updateUI = () => {
            setShowLeft(container.scrollLeft > 0);
            setShowRight(
                container.scrollLeft + container.clientWidth < container.scrollWidth
            );

            const cardWidthWithGap = getCardWidth() + 16;
            const index =
                Math.round(container.scrollLeft / cardWidthWithGap) + 1;
            setCurrentIndex(Math.min(Math.max(index, 1), books.length));
        };

        updateUI();
        container.addEventListener("scroll", updateUI);
        return () => {
            container.removeEventListener("scroll", updateUI);
        };
    }, [books]);

    useEffect(() => {
        if (scrollRef.current && books.length > 0) {
            const randomIndex = Math.floor(Math.random() * books.length);
            const cardWidthWithGap = getCardWidth() + 16;
            scrollRef.current.scrollTo({
                left:
                    randomIndex * cardWidthWithGap -
                    scrollRef.current.clientWidth / 2 +
                    cardWidthWithGap / 2,
                behavior: "smooth",
            });
        }
    }, [books]);

    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;
        const handleWheel = (e: WheelEvent) => {
            if (Math.abs(e.deltaY) > 0) {
                e.preventDefault();
                container.scrollLeft += e.deltaY;
            }
        };
        container.addEventListener("wheel", handleWheel, {passive: false});
        return () => {
            container.removeEventListener("wheel", handleWheel);
        };
    }, []);

    const scrollByAmount = (amount: number) => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({left: amount, behavior: "smooth"});
        }
    };

    const cardWidth = getCardWidth();

    return (
        <div style={{position: "relative"}}>
            {/* Overlay with current book count */}
            <div
                style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    backgroundColor: "rgba(0,0,0,0.6)",
                    color: "#fff",
                    padding: "4px 8px",
                    borderRadius: 6,
                    fontSize: 14,
                    zIndex: 10,
                }}
            >
                {currentIndex} of {books.length} books
            </div>

            {/* Scroll container */}
            <div
                ref={scrollRef}
                style={{
                    overflowX: "auto",
                    display: "flex",
                    gap: "16px",
                    alignItems: "flex-start",
                    WebkitOverflowScrolling: "touch",
                    scrollSnapType: "x mandatory", // mandatory snap
                    padding: "10px",
                }}
            >
                {books.map((book, index) => (
                    <Card
                        key={index}
                        style={{
                            width: cardWidth,
                            flex: "0 0 auto",
                            display: "flex",
                            flexDirection: "column",
                            scrollSnapAlign: "center", // ✅ center snapping
                        }}
                        cover={
                            book.image_url && (
                                <img
                                    alt={book.title}
                                    src={book.image_url}
                                    style={{
                                        width: "100%",
                                        height: "auto",
                                        maxHeight: 300,
                                        objectFit: "contain",
                                        backgroundColor: "#fafafa",
                                    }}
                                />
                            )
                        }
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 4,
                            }}
                        >
                            <Title level={4} style={{marginBottom: 0, marginRight: 8}}>
                                {book.title}
                            </Title>
                            {book.amazon_link && (
                                <Button
                                    href={book.amazon_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        background: "linear-gradient(90deg, #FF9900, #FFB84D)",
                                        borderColor: "#FF9900",
                                        color: "#111",
                                        fontWeight: "bold",
                                        borderRadius: 6,
                                        height: 28,
                                        padding: "0 10px",
                                    }}
                                    size="small"
                                    icon={<LinkOutlined/>}
                                >
                                    Amazon
                                </Button>
                            )}
                        </div>

                        <Paragraph type="secondary" style={{marginBottom: 8}}>
                            {book.author}
                        </Paragraph>

                        {book.synopsis && (
                            <Paragraph style={{whiteSpace: "normal"}}>
                                {book.synopsis}
                            </Paragraph>
                        )}
                    </Card>
                ))}
            </div>

            {showLeft && (
                <Button
                    shape="circle"
                    icon={<LeftOutlined/>}
                    size="large"
                    onClick={() => scrollByAmount(-(cardWidth + 16))}
                    style={{
                        position: "absolute",
                        left: 0,
                        top: "50%",
                        transform: "translateY(-50%)",
                        backgroundColor: "rgba(255,255,255,0.6)",
                        boxShadow: "0 0 10px rgba(0,0,0,0.2)",
                        border: "none",
                    }}
                />
            )}

            {showRight && (
                <Button
                    shape="circle"
                    icon={<RightOutlined/>}
                    size="large"
                    onClick={() => scrollByAmount(cardWidth + 16)}
                    style={{
                        position: "absolute",
                        right: 0,
                        top: "50%",
                        transform: "translateY(-50%)",
                        backgroundColor: "rgba(255,255,255,0.6)",
                        boxShadow: "0 0 10px rgba(0,0,0,0.2)",
                        border: "none",
                    }}
                />
            )}
        </div>
    );
};

export default BookList;