import {useQuery} from '@tanstack/react-query';
import {getCatalog} from '@/lib/pizzeria.functions';
export function useBrand(){const {data}=useQuery({queryKey:['catalog'],queryFn:()=>getCatalog()});return {name:data?.settings.establishment_name||'FH Foods',logo:data?.settings.logo_url||''};}