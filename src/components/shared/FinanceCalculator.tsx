import { useState, useMemo } from "react";

export default function FinanceCalculator({ defaultValue = 300000 }: { defaultValue?: number }) {
  const [propertyValue, setPropertyValue] = useState(defaultValue);
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [years, setYears] = useState(30);
  const rate = 0.0095;

  const result = useMemo(() => {
    const downPayment = propertyValue * (downPaymentPct / 100);
    const financed = propertyValue - downPayment;
    const months = years * 12;
    const monthly = (financed * (rate * Math.pow(1 + rate, months))) / (Math.pow(1 + rate, months) - 1);
    const total = monthly * months + downPayment;
    return { downPayment, financed, monthly, total, months };
  }, [propertyValue, downPaymentPct, years]);

  const fmt = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  return (
    <div className="bg-card rounded-2xl p-8 border border-border shadow-xl">
      <h3 className="text-2xl font-bold mb-6 text-foreground">Simulador de Financiamento</h3>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between text-sm font-medium text-foreground">
            <span>Valor do Imóvel</span>
            <span className="text-secondary font-bold">{fmt(propertyValue)}</span>
          </div>
          <input
            type="range"
            value={propertyValue}
            onChange={(e) => setPropertyValue(+e.target.value)}
            min={100000}
            max={10000000}
            step={50000}
            className="w-full mt-2 accent-primary"
          />
        </div>

        <div>
          <div className="flex justify-between text-sm font-medium text-foreground">
            <span>Entrada</span>
            <span className="text-secondary font-bold">{downPaymentPct}% ({fmt(result.downPayment)})</span>
          </div>
          <input
            type="range"
            value={downPaymentPct}
            onChange={(e) => setDownPaymentPct(+e.target.value)}
            min={10}
            max={80}
            step={5}
            className="w-full mt-2 accent-primary"
          />
        </div>

        <div>
          <div className="flex justify-between text-sm font-medium text-foreground">
            <span>Prazo</span>
            <span className="text-secondary font-bold">{years} anos ({result.months} parcelas)</span>
          </div>
          <input
            type="range"
            value={years}
            onChange={(e) => setYears(+e.target.value)}
            min={5}
            max={35}
            step={1}
            className="w-full mt-2 accent-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-8">
        <div className="bg-secondary text-secondary-foreground p-5 rounded-xl">
          <p className="text-xs uppercase tracking-wider opacity-80">Parcela Mensal</p>
          <p className="text-2xl font-bold mt-1">{fmt(result.monthly)}</p>
        </div>
        <div className="bg-primary text-primary-foreground p-5 rounded-xl">
          <p className="text-xs uppercase tracking-wider opacity-80">Total Financiado</p>
          <p className="text-2xl font-bold mt-1">{fmt(result.financed)}</p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-4">*Simulação aproximada. Taxa de ~11,4% a.a.</p>
    </div>
  );
}
