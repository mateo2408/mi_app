export interface DiagnosticsEndpoints {
  pets: string;
  inventory: string;
  catalog: string;
  createDiagnosis: string;
  createDisease: string;
  outbreakSummary: string;
  treatmentCases(diseaseId: string): string;
  recentDiagnoses(days?: number, limit?: number): string;
  applyTreatment: string;
}

export class DiagnosticsEndpointFactory {
  static create(baseUrl: string): DiagnosticsEndpoints {
    const root = `${baseUrl}/diagnostics`;

    return {
      pets: `${baseUrl}/pets`,
      inventory: `${baseUrl}/inventory`,
      catalog: `${root}/catalog`,
      createDiagnosis: root,
      createDisease: `${root}/catalog`,
      outbreakSummary: `${root}/analyze/all`,
      treatmentCases: (diseaseId: string) => `${root}/treatment/${diseaseId}/cases`,
      recentDiagnoses: (days = 30, limit = 10) => `${root}/history/recent?days=${days}&limit=${limit}`,
      applyTreatment: `${root}/treatment/apply`
    };
  }
}
