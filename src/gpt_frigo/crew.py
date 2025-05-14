import json
from pathlib import Path
from typing import List

from crewai import Agent, Crew, Process, Task  # type: ignore
from crewai.agents.agent_builder.base_agent import BaseAgent  # type: ignore
from crewai.project import CrewBase, after_kickoff, agent, crew, task  # type: ignore
from crewai_tools import JSONSearchTool  # type: ignore

# If you want to run a snippet of code before or after the crew starts,
# you can use the @before_kickoff and @after_kickoff decorators
# https://docs.crewai.com/concepts/crews#example-crew-class-with-decorators


@CrewBase
class GptFrigo:
    """GptFrigo crew"""

    agents: List[BaseAgent]
    tasks: List[Task]

    # directory_path = Path(__file__).parent / "data"
    recette_path = Path(__file__).parent.parent.parent / "data" / "recettes.json"
    print(f"Recette path: {recette_path}")

    recette_tool = JSONSearchTool(
        file_path=recette_path,
        json_path="$.recettes",
    )

    # === AGENT ===
    @agent
    def agent_recettes(self) -> Agent:
        return Agent(
            config=self.agents_config["agent_recettes"],  # type: ignore[index]
            tools=[self.recette_tool],
            verbose=True,
            allow_delegation=False,
        )

    def _charger_frigo(self) -> str:
        try:
            # Simplify path resolution to be more robust
            frigo_path = Path(__file__).parent.parent.parent / "data" / "frigo.json"
            print(f"Frigo path: {frigo_path}")

            print(f"Trying to load frigo data from: {frigo_path}")

            with open(frigo_path, "r", encoding="utf-8") as f:
                frigo_data = json.load(f)
                frigo_noms = [item["nom"] for item in frigo_data.get("disponible", [])]
            return ", ".join(frigo_noms)
        except Exception as e:
            print(f"Erreur de chargement du frigo : {e}")
            return ""

    @task
    def task_recommandation(self) -> Task:
        frigo_str = self._charger_frigo()

        task_cfg = self.tasks_config["recommandation_task"]
        task_cfg["description"] = task_cfg["description"].format(frigo_str=frigo_str)

        print("✅ Prompt envoyé au LLM:\n", task_cfg["description"])
        return Task(config=task_cfg, output_file_path="./data/output.txt")

    @crew
    def crew(self) -> Crew:
        """Creates the GptFrigo crew"""
        # To learn how to add knowledge sources to your crew, check out the documentation:
        # https://docs.crewai.com/concepts/knowledge#what-is-knowledge

        return Crew(
            agents=self.agents,  # Automatically created by the @agent decorator
            tasks=self.tasks,  # Automatically created by the @task decorator
            process=Process.sequential,
            verbose=True,
            # process=Process.hierarchical, # In case you wanna use that instead https://docs.crewai.com/how-to/Hierarchical/
        )

    @after_kickoff
    def save_results(self, results):
        """Sauvegarde les résultats dans un fichier texte après la fin de l'exécution"""
        output_path = Path("output.txt")
        # Si les résultats sont une liste, les joindre en un seul texte
        if isinstance(results, list):
            output_text = "\n\n".join([str(result) for result in results])
        else:
            output_text = str(results)
        # Écriture des résultats dans le fichier
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(output_text)
        print(f"✅ Résultats sauvegardés dans {output_path}")
