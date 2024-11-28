// src/app/api/certificates/download/route.ts
export const dynamic = "force-dynamic";

// src/app/api/certificates/download/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Certificate from "@/models/Certificate";
import User from "@/models/User";
import Course from "@/models/Course";
import { getSession } from "@/lib/auth/auth";
import { generateCertificatePDF } from "@/lib/services/certificate-service";

export async function GET(request: Request) {
  try {
    console.log("Iniciando download do certificado...");
    await connectDB();

    const session = await getSession();
    if (!session?.id) {
      console.log("Usuário não autenticado");
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const certificateId = searchParams.get("certificateId");

    if (!certificateId) {
      console.log("ID do certificado não fornecido");
      return new NextResponse("ID do certificado é obrigatório", {
        status: 400,
      });
    }

    console.log("Buscando certificado...");
    const certificate = await Certificate.findById(certificateId)
      .populate({
        path: "user",
        model: User,
        select: "name",
      })
      .populate({
        path: "course",
        model: Course,
        select: "title hours",
      });

    if (!certificate) {
      console.log("Certificado não encontrado");
      return new NextResponse("Certificado não encontrado", { status: 404 });
    }

    // Verifica se o usuário tem acesso a este certificado
    if (certificate.user._id.toString() !== session.id) {
      console.log("Usuário não tem permissão para acessar este certificado");
      return new NextResponse("Não autorizado", { status: 401 });
    }

    console.log("Gerando PDF do certificado...");
    const pdf = await generateCertificatePDF({
      studentName: certificate.user.name,
      courseName: certificate.course.title,
      completionDate: certificate.issuedAt,
      validationCode: certificate.validationCode,
      quizScore: certificate.quizScore,
      courseHours: certificate.course.hours || 10,
    });

    console.log("PDF gerado com sucesso. Retornando arquivo...");
    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="certificado-${certificate.course.title
          .toLowerCase()
          .replace(/\s+/g, "-")}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Erro detalhado ao gerar certificado:", error);
    return new NextResponse(
      `Erro interno do servidor: ${
        error instanceof Error ? error.message : "Erro desconhecido"
      }`,
      { status: 500 }
    );
  }
}
