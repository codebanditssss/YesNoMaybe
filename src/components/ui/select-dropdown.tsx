import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Option {
  value: string;
  label: string;
  icon?: React.ElementType;
}

interface SelectDropdownProps {
  options: Option[];
  selected: string;
  onSelect: (value: string) => void;
  buttonLabel?: string;
  buttonIcon?: React.ElementType;
  renderOption?: (option: Option, isSelected: boolean) => React.ReactNode;
}

export function SelectDropdown({
  options,
  selected,
  onSelect,
  buttonLabel,
  buttonIcon: ButtonIcon,
  renderOption,
}: SelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const selectedOption = options.find(o => o.value === selected);

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(o => !o)}
        className={`border-gray-200 text-black hover:bg-gray-50 hover:border-gray-300 py-2.5 px-4 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md flex items-center ${
          open ? "bg-gray-50 border-gray-300" : ""
        }`}
        type="button"
      >
        {ButtonIcon && <ButtonIcon className="h-4 w-4 mr-2" />}
        {buttonLabel || selectedOption?.label}
        <ChevronDown className={`h-4 w-4 ml-2 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </Button>
      {open && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
          <div className="py-1">
            {options.map(option => (
              <button
                key={option.value}
                onClick={() => {
                  onSelect(option.value);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm transition-colors duration-150 flex items-center ${
                  selected === option.value
                    ? "bg-gray-50 text-black font-medium"
                    : "text-black hover:bg-gray-50"
                }`}
                type="button"
              >
                {option.icon && <option.icon className="h-4 w-4 mr-2" />}
                {renderOption
                  ? renderOption(option, selected === option.value)
                  : option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}