import React from "react";

interface TextInputProps {
    label: string;
    type: string;
    name: string;
    value?: string;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
  }

export const TextInput: React.FC<TextInputProps> = ({label,type,name,value,onChange}) => {
    return(
        <div className="mb-4">
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>

            <input 
            type={type}
             name={name}
             id={name}
             value={value}
             onChange={onChange}
             className="w-full px-4 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
             />
        </div>
    )
}