import Link from "next/link";
import type {
  EducationDto,
  ExperienceDto,
  InterestDto,
  LanguageDto,
  PersonalSkillDto,
  ProfileDto,
  ProjectDto,
  SkillCategoryDto,
  SkillDto,
  TrainingDto
} from "@ankita-portfolio/shared-types";
import { ArrowRight, BookOpen, Briefcase, CheckCircle2, FlaskConical, GraduationCap, Languages, Sparkles } from "lucide-react";
import { Section } from "@/components/common/section";
import { MotionReveal } from "@/components/common/motion-reveal";
import { EmptyState } from "@/components/portfolio/empty-state";
import { MediaImage } from "@/components/common/media-image";
import { mediaDownloadUrl } from "@/lib/media";
import { formatDisplayDate } from "@/lib/utils";

export function AboutSection({ profile, personalSkills }: { profile: ProfileDto; personalSkills: PersonalSkillDto[] }) {
  return (
    <Section id="about" eyebrow="About" title="Pharmaceutical research mindset" description={profile.professionalSummary}>
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <MotionReveal className="overflow-hidden rounded shadow-soft">
          <MediaImage asset={profile.aboutImage || profile.profileImage} alt={`${profile.name} about`} />
        </MotionReveal>
        <MotionReveal>
          <div className="space-y-5 text-base leading-8 text-slate-700 dark:text-slate-300">
            <p>{profile.professionalBiography}</p>
            <p>{profile.careerObjective}</p>
          </div>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {profile.keyStrengths.map((strength) => (
              <div key={strength} className="flex items-center gap-3 rounded border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                <CheckCircle2 className="h-5 w-5 text-leaf" aria-hidden />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{strength}</span>
              </div>
            ))}
          </div>
          {personalSkills.length ? (
            <div className="mt-7 flex flex-wrap gap-2">
              {personalSkills.map((skill) => (
                <span key={skill.id} className="rounded bg-teal-50 px-3 py-1 text-sm text-aqua dark:bg-teal-950/60">
                  {skill.title}
                </span>
              ))}
            </div>
          ) : null}
        </MotionReveal>
      </div>
    </Section>
  );
}

export function ExperienceSection({ experiences }: { experiences: ExperienceDto[] }) {
  return (
    <Section id="experience" eyebrow="Experience" title="Research experience">
      {experiences.length ? (
        <div className="space-y-5">
          {experiences.map((item) => (
            <MotionReveal key={item.id} className="rounded border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-5 w-5 text-cobalt dark:text-teal-200" aria-hidden />
                    <h3 className="text-xl font-semibold text-ink dark:text-white">{item.jobTitle}</h3>
                  </div>
                  <p className="mt-2 font-medium text-slate-700 dark:text-slate-200">{item.organisation}</p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {[item.location, item.employmentType, formatDisplayDate(item)].filter(Boolean).join(" | ")}
                  </p>
                  {item.professionalSummary ? <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">{item.professionalSummary}</p> : null}
                </div>
                <span className="rounded bg-mist px-3 py-1 text-sm font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {formatDisplayDate(item)}
                </span>
              </div>
              {item.responsibilities.length || item.keyAchievements.length || item.researchAreas.length || item.toolsUsed.length ? (
                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  {item.responsibilities.length ? (
                    <div>
                      <h4 className="text-sm font-semibold uppercase tracking-[0.15em] text-aqua">Responsibilities</h4>
                      <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-600 dark:text-slate-300">
                        {item.responsibilities.map((responsibility) => (
                          <li key={responsibility}>{responsibility}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {item.keyAchievements.length ? (
                    <div>
                      <h4 className="text-sm font-semibold uppercase tracking-[0.15em] text-aqua">Achievements</h4>
                      <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-600 dark:text-slate-300">
                        {item.keyAchievements.map((achievement) => (
                          <li key={achievement}>{achievement}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {item.researchAreas.length ? (
                    <div>
                      <h4 className="text-sm font-semibold uppercase tracking-[0.15em] text-aqua">Research areas</h4>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {item.researchAreas.map((area) => (
                          <span key={area} className="rounded bg-mist px-3 py-2 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {item.toolsUsed.length ? (
                    <div>
                      <h4 className="text-sm font-semibold uppercase tracking-[0.15em] text-aqua">Tools</h4>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {item.toolsUsed.map((tool) => (
                          <span key={tool} className="rounded bg-teal-50 px-3 py-2 text-sm text-aqua dark:bg-teal-950/60">
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </MotionReveal>
          ))}
        </div>
      ) : (
        <EmptyState title="Experience will appear after it is published." />
      )}
    </Section>
  );
}

export function EducationSection({ education }: { education: EducationDto[] }) {
  return (
    <Section id="education" eyebrow="Education" title="Academic foundation">
      {education.length ? (
        <div className="grid gap-5 md:grid-cols-2">
          {education.map((item) => (
            <MotionReveal key={item.id} className="rounded border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
              <GraduationCap className="h-7 w-7 text-aqua" aria-hidden />
              <h3 className="mt-4 text-xl font-semibold text-ink dark:text-white">{item.qualification}</h3>
              <p className="mt-2 font-medium text-slate-700 dark:text-slate-200">{item.institution}</p>
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{formatDisplayDate(item)}</p>
              {item.fieldOfStudy ? <p className="mt-3 text-slate-600 dark:text-slate-300">{item.fieldOfStudy}</p> : null}
              {(item.grade || item.percentage) && (
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                  {[item.grade, item.percentage].filter(Boolean).join(" | ")}
                </p>
              )}
              {item.subjects.length ? (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold uppercase tracking-[0.15em] text-aqua">Subjects</h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.subjects.map((subject) => (
                      <span key={subject} className="rounded bg-mist px-3 py-2 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              {item.academicAchievements.length ? (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold uppercase tracking-[0.15em] text-aqua">Academic achievements</h4>
                  <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {item.academicAchievements.map((achievement) => (
                      <li key={achievement}>{achievement}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {item.supportingDocument ? (
                <a
                  href={mediaDownloadUrl(item.supportingDocument.id)}
                  className="mt-4 inline-flex items-center gap-2 font-semibold text-cobalt hover:text-aqua dark:text-teal-200"
                >
                  Supporting document
                </a>
              ) : null}
            </MotionReveal>
          ))}
        </div>
      ) : (
        <EmptyState title="Education records will appear after they are published." />
      )}
    </Section>
  );
}

export function TrainingSection({ training }: { training: TrainingDto[] }) {
  return (
    <Section id="training" eyebrow="Training" title="Professional training">
      {training.length ? (
        <div className="grid gap-5">
          {training.map((item) => (
            <MotionReveal key={item.id} className="rounded border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <FlaskConical className="h-6 w-6 text-leaf" aria-hidden />
                <h3 className="text-xl font-semibold text-ink dark:text-white">{item.trainingTitle}</h3>
              </div>
              <p className="mt-2 font-medium text-slate-700 dark:text-slate-200">{item.organisation}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {[item.department, item.location, formatDisplayDate(item)].filter(Boolean).join(" | ")}
              </p>
              {item.description ? <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">{item.description}</p> : null}
              {item.responsibilities.length || item.learningOutcomes.length || item.skillsDeveloped.length ? (
                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  {item.responsibilities.length ? (
                    <div>
                      <h4 className="text-sm font-semibold uppercase tracking-[0.15em] text-aqua">Responsibilities</h4>
                      <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-600 dark:text-slate-300">
                        {item.responsibilities.map((responsibility) => (
                          <li key={responsibility}>{responsibility}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {item.learningOutcomes.length ? (
                    <div>
                      <h4 className="text-sm font-semibold uppercase tracking-[0.15em] text-aqua">Learning outcomes</h4>
                      <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-600 dark:text-slate-300">
                        {item.learningOutcomes.map((outcome) => (
                          <li key={outcome}>{outcome}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {item.skillsDeveloped.length ? (
                    <div>
                      <h4 className="text-sm font-semibold uppercase tracking-[0.15em] text-aqua">Skills developed</h4>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {item.skillsDeveloped.map((skill) => (
                          <span key={skill} className="rounded bg-teal-50 px-3 py-2 text-sm text-aqua dark:bg-teal-950/60">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </MotionReveal>
          ))}
        </div>
      ) : (
        <EmptyState title="Training records will appear after they are published." />
      )}
    </Section>
  );
}

export function SkillsSection({
  categories,
  skills,
  languages,
  interests
}: {
  categories: SkillCategoryDto[];
  skills: SkillDto[];
  languages: LanguageDto[];
  interests: InterestDto[];
}) {
  return (
    <Section id="skills" eyebrow="Skills" title="Software, research and personal strengths">
      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          {categories.map((category) => {
            const categorySkills = skills.filter((skill) => skill.category.id === category.id);
            if (!categorySkills.length) {
              return null;
            }
            return (
              <MotionReveal key={category.id} className="rounded border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
                <h3 className="flex items-center gap-3 text-lg font-semibold text-ink dark:text-white">
                  <Sparkles className="h-5 w-5 text-saffron" aria-hidden />
                  {category.name}
                </h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {categorySkills.map((skill) => (
                    <span key={skill.id} className="rounded bg-mist px-3 py-2 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      {skill.name}
                    </span>
                  ))}
                </div>
              </MotionReveal>
            );
          })}
        </div>
        <div className="space-y-5">
          <MotionReveal className="rounded border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <h3 className="flex items-center gap-3 text-lg font-semibold text-ink dark:text-white">
              <Languages className="h-5 w-5 text-cobalt dark:text-teal-200" aria-hidden />
              Languages
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {languages.map((language) => (
                <span key={language.id} className="rounded bg-teal-50 px-3 py-2 text-sm font-medium text-aqua dark:bg-teal-950/60">
                  {language.name}
                </span>
              ))}
            </div>
          </MotionReveal>
          <MotionReveal className="rounded border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <h3 className="flex items-center gap-3 text-lg font-semibold text-ink dark:text-white">
              <BookOpen className="h-5 w-5 text-leaf" aria-hidden />
              Interests
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {interests.map((interest) => (
                <span key={interest.id} className="rounded bg-mist px-3 py-2 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {interest.title}
                </span>
              ))}
            </div>
          </MotionReveal>
        </div>
      </div>
    </Section>
  );
}

export function ProjectsSection({ projects, compact = false }: { projects: ProjectDto[]; compact?: boolean }) {
  const visible = compact ? projects.filter((project) => project.isFeatured).slice(0, 3) : projects;
  return (
    <Section id="projects" eyebrow="Projects" title="Project work">
      {visible.length ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((project) => (
            <MotionReveal key={project.id} className="overflow-hidden rounded border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900">
              <div className="aspect-[4/3]">
                <MediaImage asset={project.thumbnail || project.openGraphImage} alt={project.title} sizes="(max-width: 768px) 100vw, 33vw" />
              </div>
              <div className="p-5">
                <p className="text-sm font-medium text-aqua">{[project.category, project.projectStatus || project.duration].filter(Boolean).join(" | ")}</p>
                <h3 className="mt-2 text-xl font-semibold text-ink dark:text-white">{project.title}</h3>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{project.shortDescription}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.toolsAndTechnologies.map((tool) => (
                    <span key={tool} className="rounded bg-mist px-2 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {tool}
                    </span>
                  ))}
                </div>
                <Link href={`/projects/${project.slug}`} className="mt-5 inline-flex items-center gap-2 font-semibold text-cobalt hover:text-aqua dark:text-teal-200">
                  View
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </MotionReveal>
          ))}
        </div>
      ) : (
        <EmptyState title="Published projects will appear here." />
      )}
    </Section>
  );
}
