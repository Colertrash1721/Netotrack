import {Entity, PrimaryGeneratedColumn, Column} from 'typeorm';


@Entity('login') 
export class Login {
  @PrimaryGeneratedColumn()
  idUser: number;

  @Column({ unique: true })
  NameUser: string;

  @Column()
  passwordUser: string;

  @Column()
  emailUser: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  creationDate: Date;

  @Column()
  lastConnection: Date;


}