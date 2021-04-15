import SignUpController from "./signup"
import { MissingParamError, InvalidParamError , ServerError } from "../errors";
import { EmailValidator } from "../protocols";

interface SutTypes {
    sut: SignUpController,
    emailValidatorStub: EmailValidator
}

const makeSut = (): SutTypes => {
    // Stub = Dublê de teste
    class EmailValidatorStub implements EmailValidator {
        isValid(email: string): boolean {
            return true;
        }
    }

    const emailValidatorStub = new EmailValidatorStub();
    const sut = new SignUpController(emailValidatorStub);

    return {
        sut,
        emailValidatorStub
    }
}

describe("SignUp Controller", () => {
  test("Should return 400 if no name is provided", () => {
    // sut significa (S)istem (U)nder (T)est
    const {sut} = makeSut()
    const httpRequest = {
      body: {
        /* name: "any_name", */
        email: "email@mail.com",
        password: "any_password",
        passwordConfirmation: "any_password"
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError("name"))
  })

  test("Should return 400 if no email is provided", () => {
    // sut significa (S)istem (U)nder (T)est
    const {sut} = makeSut()
    const httpRequest = {
      body: {
        name: "any_name",
        // email: "email@mail.com",
        passwordConfirmation: "any_password",
        password: "any_password"
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError("email"))
  })

  test("Should return 400 if no password is provided", () => {
    // sut significa (S)istem (U)nder (T)est
    const {sut} = makeSut()
    const httpRequest = {
      body: {
        name: "any_name",
        email: "email@mail.com",
        passwordConfirmation: "any_password"
        // password: "any_password"
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError("password"))
  })

  test("Should return 400 if an invalid email is provided", () => {
    // sut significa (S)istem (U)nder (T)est
    const { sut, emailValidatorStub } = makeSut();

    jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false);

    const httpRequest = {
      body: {
        name: "any_name",
        email: "invalid_email@mail.com",
        password: "any_password",
        passwordConfirmation: "any_password"
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new InvalidParamError("email"))
  })

  test("Should call EmailValidator with correct email", () => {
    // sut significa (S)istem (U)nder (T)est
    const { sut, emailValidatorStub } = makeSut();

    const isValidSpy = jest.spyOn(emailValidatorStub, 'isValid');

    const httpRequest = {
      body: {
        name: "any_name",
        email: "any_any_email@mail.com",
        password: "any_password",
        passwordConfirmation: "any_password"
      }
    }
    sut.handle(httpRequest);
    expect(isValidSpy).toHaveBeenCalledWith(httpRequest.body.email);
  })

  test("Should return 500 if emailValidator throws", () => {
    // Stub = Dublê de teste
    class EmailValidatorStub implements EmailValidator {
        isValid(email: string): boolean {
            throw new Error();
        }
    }

    const emailValidatorStub = new EmailValidatorStub();
    const sut = new SignUpController(emailValidatorStub);

    const httpRequest = {
      body: {
        name: "any_name",
        email: "any_email@mail.com",
        password: "any_password",
        passwordConfirmation: "any_password"
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })


})
