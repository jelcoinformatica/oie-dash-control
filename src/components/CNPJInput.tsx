import React, { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from '../hooks/use-toast';

interface CNPJInputProps {
  value?: string;
  onValueChange: (value: string) => void;
  onDataLoaded?: (data: { razaoSocial: string; nomeFantasia: string }) => void;
  onError: (error: string | null) => void;
  onLoading: (loading: boolean) => void;
  error?: string;
  loading?: boolean;
}

export const CNPJInput = ({ 
  value = '', 
  onValueChange, 
  onDataLoaded, 
  onError, 
  onLoading, 
  error, 
  loading 
}: CNPJInputProps) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const validateCnpj = (cnpj: string) => {
    if (cnpj.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(cnpj)) return false;
    
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum1 = 0;
    for (let i = 0; i < 12; i++) {
      sum1 += parseInt(cnpj[i]) * weights1[i];
    }
    const remainder1 = sum1 % 11;
    const dv1 = remainder1 < 2 ? 0 : 11 - remainder1;
    
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum2 = 0;
    for (let i = 0; i < 13; i++) {
      sum2 += parseInt(cnpj[i]) * weights2[i];
    }
    const remainder2 = sum2 % 11;
    const dv2 = remainder2 < 2 ? 0 : 11 - remainder2;
    
    return parseInt(cnpj[12]) === dv1 && parseInt(cnpj[13]) === dv2;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onError(null);
    onLoading(false);
  };

  const handleBlur = async () => {
    const cnpj = localValue.replace(/\D/g, '');
    
    if (cnpj.length === 14) {
      const formatted = cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
      setLocalValue(formatted);
      onValueChange(formatted);
      
      if (!validateCnpj(cnpj)) {
        onError('CNPJ inválido - Dígitos verificadores incorretos');
        return;
      }
      
      onLoading(true);
      onError(null);
      
      try {
        const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
        
        if (response.ok) {
          const data = await response.json();
          
          if (onDataLoaded) {
            onDataLoaded({
              razaoSocial: data.legal_name || data.company_name || '',
              nomeFantasia: data.trade_name || data.fantasy_name || ''
            });
          }
          
          toast({
            title: "CNPJ consultado com sucesso",
            description: `Dados da empresa ${data.legal_name || data.company_name} foram preenchidos automaticamente.`,
            duration: 3000,
          });
        } else {
          throw new Error('CNPJ não encontrado na Receita Federal');
        }
      } catch (error) {
        onError(`Erro ao consultar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      } finally {
        onLoading(false);
      }
    } else if (cnpj.length > 0) {
      onError('CNPJ deve ter 14 dígitos');
      onValueChange(localValue);
    } else {
      onError(null);
      onValueChange(localValue);
    }
  };

  return (
    <div className="space-y-1">
      <Label className="text-xs">CNPJ</Label>
      <div className="space-y-1">
        <div className="flex gap-2">
          <Input
            value={localValue}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`h-8 flex-1 ${error ? 'border-red-500' : ''}`}
            placeholder="00.000.000/0000-00"
            maxLength={18}
          />
          {loading && (
            <div className="flex items-center px-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            </div>
          )}
        </div>
        {error && (
          <span className="text-xs text-red-500">{error}</span>
        )}
        {loading && (
          <span className="text-xs text-blue-500">Consultando Receita Federal...</span>
        )}
      </div>
    </div>
  );
};