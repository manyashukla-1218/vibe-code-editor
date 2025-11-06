"use server";
import { db } from "@/lib/db";
import{ currentUser } from "@/modules/auth/actions";
import { revalidatePath } from "next/cache";

export const getAllPlaygroundForUser = async()=>{
    const user = await currentUser();
    try {
        const playground = await db.playground.findMany({
            where:{
                userId:user?.id    
            },
            include:{
                user:true,
                Starmark:{
                    where:{
                        userId:user?.id!
                    },
                    select:{
                        isMarked:true
                    }
                }
            },
        });
        return playground
    } catch (error) {
        console.log(error)
    }
}
export const createPlayground = async(data:{
   title: string;
   template: "REACT" | "NEXTJS" | "EXPRESS" |"VUE" |"HONO" | "ANGULAR";
   description?: string;
   })=>{
    const user = await currentUser();
    const {template , title , description} = data;

    try {
        const playground = await db.playground.create({
            data:{
                title:title,
                description:description,
                template:template,
                userId: user?.id || "",
            }
        })
        return playground;
    } catch (error) {
       console.log(error)
    }
   }

   export const deleteProjectById = async(id:string)=>{
         try {
            await db.playground.delete({
                where: {
                    id
                }
            })
            revalidatePath("/dashboard")
         } catch (error) {
            console.log(error)
         }
   }
   export const editProjectById = async(id:string , data:{title:string , description:string})=>{
    try {
        await db.playground.update({
            where:{
                id
            },
            data:data
        })
        revalidatePath("/dashboard")
    } catch (error) {
        console.log(error)
    }
   }

   export const duplicateProjectById = async (id:string) =>{
    try {
        const originalPlayground = await db.playground.findUnique({
            where:{id},
        })
        if(!originalPlayground) {
            throw new Error("Original playground not found");
        }
        const duplicatePlayground = await db.playground.create({
            data:{
                title:'${originalPlayground.title} (copy)',
                description:originalPlayground.description,
                template:originalPlayground.template,
                userId:originalPlayground.userId
            }
        })
        revalidatePath("/dashboard")
        return duplicatePlayground;
    } catch (error) {
        console.error("Error duplicating project:",error);
    }
   }