import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { mayAccessProject } from "@/lib/authorization";
import { db } from "@/lib/db";
import { projectIntakes } from "@/lib/db/schema";
const input=z.object({goals:z.string().max(5000),audience:z.string().max(5000),features:z.string().max(5000),assets:z.string().max(5000),integrations:z.string().max(5000),launchTarget:z.string().max(500),notes:z.string().max(5000)});
export async function GET(_:NextRequest,{params}:{params:Promise<{projectId:string}>}){const id=(await params).projectId;if(!(await mayAccessProject(id)))return NextResponse.json({error:"Not authorized."},{status:403});return NextResponse.json(await db.query.projectIntakes.findFirst({where:eq(projectIntakes.projectId,id)})??null)}
export async function PUT(request:NextRequest,{params}:{params:Promise<{projectId:string}>}){const user=await currentUser(),id=(await params).projectId,parsed=input.safeParse(await request.json());if(!user||user.role!=="client"||!parsed.success||!(await mayAccessProject(id)))return NextResponse.json({error:"Invalid kickoff brief."},{status:400});const existing=await db.query.projectIntakes.findFirst({where:eq(projectIntakes.projectId,id)});if(existing)await db.update(projectIntakes).set({answers:parsed.data,submittedBy:user.id,updatedAt:new Date()}).where(eq(projectIntakes.id,existing.id));else await db.insert(projectIntakes).values({projectId:id,submittedBy:user.id,answers:parsed.data});return NextResponse.json({ok:true});}
