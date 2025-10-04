import React, {useState} from "react";
import {Button, Modal} from "antd";
import type {ButtonType} from "antd/es/button/buttonHelpers";

interface ConfirmButtonProps {
    label?: string;
    onConfirm: () => void;
    confirmTitle?: string;
    confirmMessage?: string;
    type?: "link" | "text" | "default" | "primary" | "dashed";
    danger?: boolean;
}

const ConfirmButton: React.FC<ConfirmButtonProps> = ({
                                                         label = "Delete",
                                                         onConfirm,
                                                         confirmTitle = "Are you sure?",
                                                         confirmMessage = "This action cannot be undone.",
                                                         type = "primary",
                                                         danger = false,
                                                     }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const showModal = () => setIsModalOpen(true);
    const handleOk = () => {
        setIsModalOpen(false);
        onConfirm(); // call the provided callback
    };
    const handleCancel = () => setIsModalOpen(false);

    return (
        <>
            <Button type={type as ButtonType} danger={danger} onClick={showModal}>
                {label}
            </Button>

            <Modal
                title={`${label} - ${confirmTitle}`}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="Yes"
                cancelText="No"
            >
                <p>{confirmMessage}</p>
            </Modal>
        </>
    );
};

export default ConfirmButton;
