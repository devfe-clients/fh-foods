import {useQuery} from '@tanstack/react-query';
import {getCatalog} from '@/lib/pizzeria.functions';
type BrandSettings={establishment_name:string;logo_url:string};
type BrandCatalog={settings:BrandSettings};
export function useBrand(){const {data}=useQuery<BrandCatalog>({queryKey:['catalog'],queryFn:()=>getCatalog() as unknown as Promise<BrandCatalog>});return {name:data?.settings.establishment_name||'FH Foods',logo:data?.settings.logo_url||''};}