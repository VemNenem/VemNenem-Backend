export interface CreateClientDTO {
    name: string;
    probableDateOfDelivery: Date;
    babyGender: 'Masculino' | 'Feminino';
    fatherName: string;
    babyName: string;
    email: string;
    password: string;
}