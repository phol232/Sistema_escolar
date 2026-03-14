"use client";

import { useEffect, useState } from "react";

export interface ActiveSchoolYear {
  id: string;
  anio: number;
}

export function useAnioEscolar(initialValue: ActiveSchoolYear | null) {
  const [anioEscolar, setAnioEscolar] = useState(initialValue);

  useEffect(() => {
    setAnioEscolar(initialValue);
  }, [initialValue]);

  return { anioEscolar };
}
