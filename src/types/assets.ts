export interface Component {
  seq: string;
  code: string;
  description: string;
  quantity: string;
  unit: string;
  location: string;
  situation: string;
  balance: string;
}

export interface Equipment {
  id: string;
  description: string;
  family: string;
  costCenter: string;
  situation: string;
  criticality: string;
  components: Component[];
}

export interface AssetTag {
  id: string;
  description: string;
  equipments: Equipment[];
}

export interface AssetMacro {
  id: string;
  description: string;
  tags: AssetTag[];
}
