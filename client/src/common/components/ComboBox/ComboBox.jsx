import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import "./styles.sass";
import Icon from "@mdi/react";
import { mdiChevronDown } from "@mdi/js";

export const ComboBox = ({ icon, id, placeholder, value, setValue, options = [], onFocus, onBlur, disabled = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [adjustedPosition, setAdjustedPosition] = useState({ top: 0, left: 0, width: 0 });
    const [isPositioned, setIsPositioned] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    const containerRef = useRef(null);
    const inputRef = useRef(null);
    const optionsRef = useRef(null);
    const optionRefs = useRef([]);

    const filteredOptions = options.filter(
        (opt) => value === "" || (opt.toLowerCase().includes(value.toLowerCase()) && opt.toLowerCase() !== value.toLowerCase())
    );

    const hasOptions = filteredOptions.length > 0;

    const updatePosition = useCallback(() => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const pos = {
            top: rect.top + rect.height + 5,
            left: rect.left,
            width: containerRef.current.offsetWidth,
        };

        if (optionsRef.current) {
            const menuRect = optionsRef.current.getBoundingClientRect();
            const { innerWidth, innerHeight } = window;

            if (pos.left + menuRect.width > innerWidth - 10) pos.left = innerWidth - menuRect.width - 10;
            if (pos.left < 10) pos.left = 10;

            if (pos.top + menuRect.height > innerHeight - 10) {
                const topPosition = rect.top - menuRect.height - 5;
                if (topPosition >= 10) pos.top = topPosition;
                else pos.top = innerHeight - menuRect.height - 10;
            }
            if (pos.top < 10) pos.top = 10;
        }

        setAdjustedPosition(pos);
    }, []);

    useEffect(() => {
        if (isOpen && hasOptions) {
            requestAnimationFrame(() => {
                setIsVisible(true);
                requestAnimationFrame(() => {
                    updatePosition();
                    setIsPositioned(true);
                });
            });
        }

        if (!isOpen) {
            setIsPositioned(false);
            setHighlightedIndex(-1);
        }
    }, [isOpen, hasOptions, updatePosition]);

    useEffect(() => {
        if (isOpen && isPositioned) updatePosition();
    }, [filteredOptions.length, isOpen, isPositioned, updatePosition]);

    const handleAnimationEnd = (e) => {
        if (e?.target === optionsRef.current && !isOpen) {
            setIsVisible(false);
        }
    };

    const handleSelect = (option) => {
        setValue(option);
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.focus();
    };

    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (containerRef.current?.contains(e.target) || optionsRef.current?.contains(e.target)) return;
            setIsOpen(false);
        };

        const handleScroll = () => {
            if (isOpen && isPositioned) updatePosition();
        };

        if (isOpen) {
            window.addEventListener("scroll", handleScroll, true);
            window.addEventListener("resize", handleScroll, true);
        }
        document.addEventListener("mousedown", handleOutsideClick);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
            window.removeEventListener("scroll", handleScroll, true);
            window.removeEventListener("resize", handleScroll, true);
        };
    }, [isOpen, isPositioned, updatePosition]);

    const handleKeyDown = (e) => {
        if (!isOpen || !hasOptions) {
            if (e.key === "ArrowDown" && hasOptions) {
                e.preventDefault();
                setIsOpen(true);
                setHighlightedIndex(0);
            }
            return;
        }

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setHighlightedIndex((prev) => {
                    const next = prev < filteredOptions.length - 1 ? prev + 1 : 0;
                    optionRefs.current[next]?.scrollIntoView({ block: "nearest", behavior: "smooth" });
                    return next;
                });
                break;
            case "ArrowUp":
                e.preventDefault();
                setHighlightedIndex((prev) => {
                    const next = prev > 0 ? prev - 1 : filteredOptions.length - 1;
                    optionRefs.current[next]?.scrollIntoView({ block: "nearest", behavior: "smooth" });
                    return next;
                });
                break;
            case "Enter":
                e.preventDefault();
                if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
                    handleSelect(filteredOptions[highlightedIndex]);
                }
                break;
            case "Escape":
                e.preventDefault();
                setIsOpen(false);
                break;
            default:
                break;
        }
    };

    const handleInputChange = (e) => {
        setValue(e.target.value);
        if (!isOpen) setIsOpen(true);
        setHighlightedIndex(-1);
    };

    const handleInputFocus = (e) => {
        if (hasOptions) setIsOpen(true);
        onFocus?.(e);
    };

    const handleChevronClick = (e) => {
        e.preventDefault();
        if (disabled) return;
        setIsOpen((prev) => !prev);
        inputRef.current?.focus();
    };

    const showDropdown = isOpen && hasOptions;

    return (
        <div className={`combo-box ${disabled ? "disabled" : ""}`} ref={containerRef}>
            <div className="combo-box__input-wrapper">
                {icon && <Icon path={icon} className="combo-box__icon" />}
                <input
                    ref={inputRef}
                    type="text"
                    id={id}
                    className="combo-box__input"
                    placeholder={placeholder}
                    value={value}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onBlur={onBlur}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    role="combobox"
                    aria-expanded={showDropdown}
                    aria-controls={`${id}-listbox`}
                    aria-haspopup="listbox"
                    aria-autocomplete="list"
                    aria-activedescendant={highlightedIndex >= 0 ? `${id}-option-${highlightedIndex}` : undefined}
                    autoComplete="off"
                />
                <div
                    className={`combo-box__chevron ${showDropdown ? "open" : ""}`}
                    onMouseDown={handleChevronClick}
                >
                    <Icon path={mdiChevronDown} />
                </div>
            </div>

            {isVisible && createPortal(
                <div
                    ref={optionsRef}
                    className={`combo-box__options ${showDropdown && isPositioned ? "open" : "closed"}`}
                    style={{
                        top: `${adjustedPosition.top}px`,
                        left: `${adjustedPosition.left}px`,
                        minWidth: `${adjustedPosition.width}px`,
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTransitionEnd={handleAnimationEnd}
                    role="listbox"
                    id={`${id}-listbox`}
                >
                    <div className="combo-box__options-scroll">
                        {filteredOptions.map((option, index) => (
                            <div
                                key={option}
                                ref={(el) => (optionRefs.current[index] = el)}
                                id={`${id}-option-${index}`}
                                className={`combo-box__option ${highlightedIndex === index ? "highlighted" : ""} ${value === option ? "selected" : ""}`}
                                onMouseDown={() => handleSelect(option)}
                                onMouseEnter={() => setHighlightedIndex(index)}
                                role="option"
                                aria-selected={value === option}
                            >
                                {option}
                            </div>
                        ))}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};
