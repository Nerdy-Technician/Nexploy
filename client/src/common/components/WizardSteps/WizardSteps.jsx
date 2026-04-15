import Icon from "@mdi/react";
import { mdiCheck } from "@mdi/js";
import "./styles.sass";

export const WizardSteps = ({ steps, currentStep, onStepChange }) => {
    return (
        <div className="wizard-steps">
            {steps.map((step, index) => (
                <div key={step.key} className="wizard-step-wrapper">
                    {index > 0 && (
                        <div className={`wizard-line${index <= currentStep ? " filled" : ""}`} />
                    )}
                    <div
                        className={`wizard-step${index === currentStep ? " active" : ""}${index < currentStep ? " completed" : ""}`}
                        onClick={() => index < currentStep && onStepChange?.(index)}
                        onKeyDown={(e) => e.key === "Enter" && index < currentStep && onStepChange?.(index)}
                        role={index < currentStep ? "button" : undefined}
                        tabIndex={index < currentStep ? 0 : undefined}
                    >
                        <div className="wizard-step-circle">
                            {index < currentStep ? (
                                <Icon path={mdiCheck} />
                            ) : (
                                <span>{index + 1}</span>
                            )}
                        </div>
                        <span className="wizard-step-label">{step.label}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};
