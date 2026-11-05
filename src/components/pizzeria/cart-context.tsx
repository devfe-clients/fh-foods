import {createContext,useContext,useEffect,useState,type ReactNode} from 'react';
import type {CartItem} from '@/lib/pizza';
type Table={id:string;label:string}|null;
type Ctx={items:CartItem[];add:(item:CartItem)=>void;remove:(key:string)=>void;clear:()=>void;replace:(items:CartItem[])=>void;table:Table;setTable:(t:Table)=>void};
const Context=createContext<Ctx>({items:[],add:()=>{},remove:()=>{},clear:()=>{},replace:()=>{},table:null,setTable:()=>{}});
export function CartProvider({children}:{children:ReactNode}){const [items,setItems]=useState<CartItem[]>([]);const [table,setTableState]=useState<Table>(null);
useEffect(()=>{try{const t=sessionStorage.getItem('fhtech:table');if(t)setTableState(JSON.parse(t));}catch{}},[]);
const setTable=(t:Table)=>{setTableState(t);try{if(t)sessionStorage.setItem('fhtech:table',JSON.stringify(t));else sessionStorage.removeItem('fhtech:table');}catch{}};
return <Context.Provider value={{items,table,setTable,replace:setItems,add:item=>setItems(previous=>[...previous.filter(i=>i.key!==item.key),item]),remove:key=>setItems(previous=>previous.filter(i=>i.key!==key)),clear:()=>setItems([])}}>{children}</Context.Provider>}
export const useCart=()=>useContext(Context);
