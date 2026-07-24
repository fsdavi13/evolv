import axios from "axios";
import { Save, UserRound } from "lucide-react";
import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useState,
} from "react";

import {
  buscarPerfil,
  salvarPerfil,
} from "../services/profileService";
import type {
  NivelAtividade,
  ProfilePayload,
  Sexo,
} from "../types/profile";

import "./ProfilePage.css";

const perfilInicial: ProfilePayload = {
  peso_kg: 0,
  altura_cm: 0,
  idade: 0,
  sexo: "masculino",
  nivel_atividade: "moderadamente_ativo",
};

function obterMensagemErro(erro: unknown): string {
  if (axios.isAxiosError(erro)) {
    const detalhe = erro.response?.data?.detail;

    if (typeof detalhe === "string") {
      return detalhe;
    }
  }

  return "Não foi possível salvar o perfil.";
}

function ProfilePage() {
  const [perfil, setPerfil] =
    useState<ProfilePayload>(perfilInicial);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] =
    useState<string | null>(null);

  useEffect(() => {
    async function carregarPerfil() {
      try {
        setCarregando(true);
        setErro(null);

        const perfilExistente = await buscarPerfil();

        if (perfilExistente) {
          setPerfil({
            peso_kg: perfilExistente.peso_kg,
            altura_cm: perfilExistente.altura_cm,
            idade: perfilExistente.idade,
            sexo: perfilExistente.sexo,
            nivel_atividade:
              perfilExistente.nivel_atividade,
          });
        }
      } catch {
        setErro(
          "Não foi possível carregar os dados do perfil.",
        );
      } finally {
        setCarregando(false);
      }
    }

    void carregarPerfil();
  }, []);

  function atualizarNumero(
    evento: ChangeEvent<HTMLInputElement>,
  ) {
    const { name, value } = evento.target;

    setPerfil((perfilAtual) => ({
      ...perfilAtual,
      [name]: value === "" ? 0 : Number(value),
    }));
  }

  function atualizarSexo(
    evento: ChangeEvent<HTMLSelectElement>,
  ) {
    setPerfil((perfilAtual) => ({
      ...perfilAtual,
      sexo: evento.target.value as Sexo,
    }));
  }

  function atualizarNivelAtividade(
    evento: ChangeEvent<HTMLSelectElement>,
  ) {
    setPerfil((perfilAtual) => ({
      ...perfilAtual,
      nivel_atividade:
        evento.target.value as NivelAtividade,
    }));
  }

  async function enviarFormulario(
    evento: FormEvent<HTMLFormElement>,
  ) {
    evento.preventDefault();

    try {
      setSalvando(true);
      setErro(null);
      setSucesso(null);

      const perfilSalvo = await salvarPerfil(perfil);

      setPerfil({
        peso_kg: perfilSalvo.peso_kg,
        altura_cm: perfilSalvo.altura_cm,
        idade: perfilSalvo.idade,
        sexo: perfilSalvo.sexo,
        nivel_atividade:
          perfilSalvo.nivel_atividade,
      });

      setSucesso("Perfil salvo com sucesso.");
    } catch (erroSalvamento) {
      setErro(obterMensagemErro(erroSalvamento));
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <section className="page">
        <p className="profile-status">
          Carregando perfil...
        </p>
      </section>
    );
  }

  return (
    <section className="page">
      <header className="page__header">
        <p className="page__eyebrow">Dados pessoais</p>
        <h1>Perfil</h1>
        <p>
          Configure seus dados para calcular seu gasto
          energético diário.
        </p>
      </header>

      <div className="profile-card">
        <div className="profile-card__header">
          <div className="profile-card__icon">
            <UserRound size={24} aria-hidden="true" />
          </div>

          <div>
            <h2>Informações físicas</h2>
            <p>
              Esses dados são usados nos cálculos
              metabólicos do Dashboard.
            </p>
          </div>
        </div>

        <form
          className="profile-form"
          onSubmit={enviarFormulario}
        >
          <div className="profile-form__grid">
            <label className="profile-field">
              <span>Peso</span>

              <div className="profile-field__input">
                <input
                  required
                  min="1"
                  step="0.1"
                  type="number"
                  name="peso_kg"
                  value={perfil.peso_kg || ""}
                  onChange={atualizarNumero}
                />

                <span>kg</span>
              </div>
            </label>

            <label className="profile-field">
              <span>Altura</span>

              <div className="profile-field__input">
                <input
                  required
                  min="1"
                  step="0.1"
                  type="number"
                  name="altura_cm"
                  value={perfil.altura_cm || ""}
                  onChange={atualizarNumero}
                />

                <span>cm</span>
              </div>
            </label>

            <label className="profile-field">
              <span>Idade</span>

              <div className="profile-field__input">
                <input
                  required
                  min="1"
                  step="1"
                  type="number"
                  name="idade"
                  value={perfil.idade || ""}
                  onChange={atualizarNumero}
                />

                <span>anos</span>
              </div>
            </label>

            <label className="profile-field">
              <span>Sexo</span>

              <select
                value={perfil.sexo}
                onChange={atualizarSexo}
              >
                <option value="masculino">
                  Masculino
                </option>

                <option value="feminino">
                  Feminino
                </option>
              </select>
            </label>

            <label className="profile-field profile-field--full">
              <span>Nível de atividade</span>

              <select
                value={perfil.nivel_atividade}
                onChange={atualizarNivelAtividade}
              >
                <option value="sedentario">
                  Sedentário
                </option>

                <option value="levemente_ativo">
                  Levemente ativo
                </option>

                <option value="moderadamente_ativo">
                  Moderadamente ativo
                </option>

                <option value="muito_ativo">
                  Muito ativo
                </option>

                <option value="extremamente_ativo">
                  Extremamente ativo
                </option>
              </select>

              <small>
                Considere sua rotina geral, incluindo
                treinos e atividades do dia a dia.
              </small>
            </label>
          </div>

          {erro && (
            <div
              className="profile-message profile-message--error"
              role="alert"
            >
              {erro}
            </div>
          )}

          {sucesso && (
            <div
              className="profile-message profile-message--success"
              role="status"
            >
              {sucesso}
            </div>
          )}

          <div className="profile-form__actions">
            <button
              className="profile-submit"
              type="submit"
              disabled={salvando}
            >
              <Save size={18} aria-hidden="true" />

              {salvando
                ? "Salvando..."
                : "Salvar perfil"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default ProfilePage;