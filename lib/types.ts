export type AssetStatus = 'available' | 'assigned' | 'maintenance' | 'retired';
export type UserRole = 'admin' | 'viewer';
export type Asset = { id: string; assetTag: string; name: string; category: string; categoryColor: string; status: AssetStatus; assignee: string | null; location: string; locationId: string | null; warrantyUntil: string; serialNumber: string; value: number };
export type Employee = { id: string; name: string; initials: string; department: string; role: string; email: string; assetCount: number; location: string };
export type HistoryEvent = { id: string; action: string; asset: string; actor: string; target: string; date: string; time: string };