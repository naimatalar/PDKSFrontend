import React from 'react';
import { ModalHeader } from 'reactstrap';

export default function AppModalHeader({ toggle, children, className = '' }) {
    const closeButton = (
        <button type="button" className="app-modal-close-btn" onClick={toggle} aria-label="Kapat">
            <i className="icon-cross2" />
        </button>
    );

    return (
        <ModalHeader className={`app-modal-header ${className}`.trim()} close={closeButton}>
            {children}
        </ModalHeader>
    );
}
